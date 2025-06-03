from django.shortcuts import render, get_object_or_404
from django.utils import timezone
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from .models import DominoPiece, Game, GamePiece, FAMILY_CHOICES
import random
import json

def home_view(request):
    return render(request, 'template_home.html')

def ensure_all_domino_pieces_exist():
    """
    Garante que todas as 28 peças estejam criadas.
    """
    if DominoPiece.objects.exists():
        return

    keys = [key for key, _ in FAMILY_CHOICES]
    for i, left in enumerate(keys):
        for j in range(i, len(keys)):
            right = keys[j]
            DominoPiece.objects.create(left=left, right=right)

def create_new_game(user=None):
    game = Game.objects.create(user=user, created_at=timezone.now(), is_finished=False)
    todas = list(DominoPiece.objects.all())
    random.shuffle(todas)

    gamepieces = [
        GamePiece(game=game, piece=peca)
        for peca in todas
    ]
    GamePiece.objects.bulk_create(gamepieces)

    # Definir extremidades com a primeira peça embaralhada e orientações H por padrão
    first_piece = todas[0]
    game.left_end = first_piece.left
    game.right_end = first_piece.right
    game.left_end_orientation = 'H'
    game.right_end_orientation = 'H'
    game.save(update_fields=["left_end", "right_end", "left_end_orientation", "right_end_orientation"])

    return game

def serialize_deck(game):
    """
    Serializa o baralho para o frontend.
    """
    return [
        {
            "piece_id": gp.piece.id,
            "left": gp.piece.left,
            "right": gp.piece.right,
            "orientation": gp.orientation,
        }
        for gp in GamePiece.objects.filter(game=game).select_related("piece")
    ]

def domino_jogo(request):
    """
    Inicializa ou reinicia um jogo.
    """
    ensure_all_domino_pieces_exist()
    game = create_new_game(user=request.user if request.user.is_authenticated else None)

    # Serializa o deck completo
    deck_data = serialize_deck(game)

    # Remover a peça inicial do estoque, pois já está posicionada na partida
    initial_piece = deck_data.pop(0)

    return render(request, "domino_jogo.html", {
        "game_id": game.id,
        "initial_piece": initial_piece,
        "deck": deck_data,
        "slots": list(range(28)),
        "left_end": game.left_end,
        "right_end": game.right_end,
    })


def json_response_ok(**extra):
    return JsonResponse({"ok": True, **extra})

def json_response_error(message, **extra):
    return JsonResponse({"ok": False, "error": message, **extra}, status=400)

@require_POST
def posicionar_peca(request):
    try:
        payload = json.loads(request.body.decode("utf-8"))
        game_id = payload["game_id"]
        piece_id = payload["piece_id"]
        position = payload["position"]
        orientation = payload.get("orientation", "H")
        side = payload.get("side")  # 'left' ou 'right'
        flipped = payload.get("flipped", False)
    except (KeyError, json.JSONDecodeError):
        return json_response_error("JSON inválido ou campos faltando.")

    if side not in ('left', 'right'):
        return json_response_error("Campo 'side' deve ser 'left' ou 'right'.")

    if orientation not in ('H', 'V'):
        return json_response_error("Orientação inválida, deve ser 'H' ou 'V'.")

    game = get_object_or_404(Game, pk=game_id)
    gp = get_object_or_404(GamePiece, game=game, piece_id=piece_id)

    if gp.position is not None:
        return json_response_error("Peça já posicionada.")

    # NOVA VALIDAÇÃO: peça não pode já estar posicionada em outra posição (duplicada)
    if GamePiece.objects.filter(game=game, position=position).exists():
        return json_response_error(f"Já existe uma peça posicionada na posição {position}.")

    piece = gp.piece

    # Verificar encaixe e inversão
    if side == 'left':
        extremidade = game.left_end
        extremidade_orient = game.left_end_orientation
        if orientation != extremidade_orient:
            return json_response_error(f"Orientação da peça deve ser '{extremidade_orient}' para conectar na extremidade esquerda.")
        if piece.right == extremidade:
            encaixada = True
            invertida = False
        elif piece.left == extremidade:
            encaixada = True
            invertida = True
        else:
            encaixada = False
    else:  # side == 'right'
        extremidade = game.right_end
        extremidade_orient = game.right_end_orientation
        if orientation != extremidade_orient:
            return json_response_error(f"Orientação da peça deve ser '{extremidade_orient}' para conectar na extremidade direita.")
        if piece.left == extremidade:
            encaixada = True
            invertida = False
        elif piece.right == extremidade:
            encaixada = True
            invertida = True
        else:
            encaixada = False

    if not encaixada:
        return json_response_error(f"A peça {piece} não encaixa na extremidade {side} ({extremidade}).")

    if flipped != invertida:
        return json_response_error(f"Flag 'flipped' incorreta para a peça {piece}.")

    # Salvamos a peça posicionada
    gp.position = position
    gp.orientation = orientation
    gp.save(update_fields=["position", "orientation"])

    # Atualizar extremidades e suas orientações conforme a peça colocada
    if side == 'left':
        game.left_end = piece.left
        game.left_end_orientation = orientation
    else:
        game.right_end = piece.right
        game.right_end_orientation = orientation

    game.save(update_fields=["left_end", "right_end", "left_end_orientation", "right_end_orientation"])

    return json_response_ok()



@require_POST
def remover_peca(request):
    """
    Remove a peça da posição, retornando ao estoque.
    """
    try:
        payload = json.loads(request.body.decode("utf-8"))
        game_id = payload["game_id"]
        piece_id = payload["piece_id"]
    except (KeyError, json.JSONDecodeError):
        return json_response_error("JSON inválido ou campos faltando.")

    gp = get_object_or_404(GamePiece, game_id=game_id, piece_id=piece_id)
    gp.position = None
    gp.save(update_fields=["position"])
    return json_response_ok()

@require_POST
def validar_sequencia(request):
    """
    Valida a sequência de peças posicionadas.
    """
    try:
        payload = json.loads(request.body.decode("utf-8"))
        game_id = payload["game_id"]
    except (KeyError, json.JSONDecodeError):
        return json_response_error("JSON inválido ou game_id faltando.")

    game = get_object_or_404(Game, pk=game_id)

    # Checar se todas as peças foram posicionadas
    if GamePiece.objects.filter(game=game, position__isnull=True).exists():
        return json_response_error("Ainda há peças no estoque.")

    sequencia = list(
        GamePiece.objects.filter(game=game)
        .select_related("piece")
        .order_by("position")
    )

    for i in range(len(sequencia) - 1):
        atual = sequencia[i].piece
        prox = sequencia[i + 1].piece
        if atual.right != prox.left:
            erro = f"Erro na posição {i}: '{atual.right}' não conecta com '{prox.left}'."
            return json_response_error(erro)

    game.is_finished = True
    game.save(update_fields=["is_finished"])
    return json_response_ok()
