from django.db import models
from django.contrib.auth.models import User

FAMILY_CHOICES = [
    ("mae", "Mãe"),
    ("pai", "Pai"),
    ("irmao", "Irmão"),
    ("avo_fem", "Avó"),
    ("avo_masc", "Avô"),
    ("tia", "Tia"),
    ("tio", "Tio"),
]

class DominoPiece(models.Model):
    """
    Cada instância representa uma das 28 peças únicas do dominó.
    A direcionalidade importa: left → right.
    """
    left = models.CharField(max_length=10, choices=FAMILY_CHOICES)
    right = models.CharField(max_length=10, choices=FAMILY_CHOICES)

    class Meta:
        unique_together = ("left", "right")

    def __str__(self):
        return f"[{self.left} | {self.right}]"

ORIENTATION_CHOICES = [
    ('H', 'Horizontal'),
    ('V', 'Vertical'),
]

class Game(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_finished = models.BooleanField(default=False)

    left_end = models.CharField(max_length=10, null=True, blank=True)  # tipo FAMILY_CHOICES key
    right_end = models.CharField(max_length=10, null=True, blank=True)

    left_end_orientation = models.CharField(max_length=1, choices=ORIENTATION_CHOICES, null=True, blank=True)
    right_end_orientation = models.CharField(max_length=1, choices=ORIENTATION_CHOICES, null=True, blank=True)

    def __str__(self):
        status = "Finalizado" if self.is_finished else "Em andamento"
        return f"Jogo #{self.pk} - {status}"


class GamePiece(models.Model):
    """
    Liga uma peça do dominó a uma partida.
    Agora com orientação: horizontal ou vertical.
    """
    flipped = models.BooleanField(default=False)
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name="pieces")
    piece = models.ForeignKey(DominoPiece, on_delete=models.CASCADE)
    position = models.PositiveSmallIntegerField(null=True, blank=True)
    orientation = models.CharField(
        max_length=1,
        choices=ORIENTATION_CHOICES,
        default='H',
    )

    class Meta:
        unique_together = ("game", "piece")

    def __str__(self):
        pos = self.position if self.position is not None else "estoque"
        return f"Game {self.game.pk} - {self.piece} @ {pos} ({self.orientation})"

    class Meta:
        unique_together = ("game", "piece")

    def __str__(self):
        pos = self.position if self.position is not None else "estoque"
        return f"Game {self.game.pk} - {self.piece} @ {pos}"
