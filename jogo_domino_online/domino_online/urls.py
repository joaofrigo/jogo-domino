from django.contrib import admin
from django.urls import include, path
from .views import *


urlpatterns = [
    path('', home_view, name='home'),   
    path("jogo/", domino_jogo, name="domino_jogo"),
    path("jogo/posicionar/", posicionar_peca, name="posicionar_peca"),
    path("jogo/remover/", remover_peca, name="remover_peca"),
    path("jogo/validar/", validar_sequencia, name="validar_sequencia"),
]
