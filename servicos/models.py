from django.db import models
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.models import User
from datetime import datetime, timedelta
import json


class Servicos(models.Model):
    nome = models.CharField(max_length=100, verbose_name=_('Nome do Serviço'))

    criado_em = models.DateTimeField(auto_now_add=True, verbose_name=_('Criado em'))
    atualizado_em = models.DateTimeField(auto_now=True, verbose_name=_('Atualizado em'))

class Servico(models.Model):
    nome = models.CharField(max_length=100, verbose_name=_('Nome do Serviço'))
    atributo1 = models.CharField(max_length=100, verbose_name=_('Atributo 1'), blank=True, null=True)
    atributo2 = models.CharField(max_length=100, verbose_name=_('Atributo 2'), blank=True, null=True)
    atributo3 = models.CharField(max_length=100, verbose_name=_('Atributo 3'), blank=True, null=True)
    criado_por = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name=_('Criado por'))
    # regioes = models.Choices(
    #     choices=[
    #         ('norte', _('Norte')),
    #         ('nordeste', _('Nordeste')),
    #         ('centro-oeste', _('Centro-Oeste')),
    #         ('sudeste', _('Sudeste')),
    #         ('sul', _('Sul'))
    # ])
    criado_em = models.DateTimeField(auto_now_add=True, verbose_name=_('Criado em'))
    atualizado_em = models.DateTimeField(auto_now=True, verbose_name=_('Atualizado em'))

    def __str__(self):
        return self.nome


class Agendar(models.Model):

    cliente = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name=_('Cliente'))
    servico = models.TextField(verbose_name=_('Serviço'), null=True, blank=True)
    horario = models.TextField(verbose_name=_('Horário'))
    cancelado = models.BooleanField(default=False, verbose_name=_('Cancelado'))
    agendado = models.BooleanField(default=False, verbose_name=_('Agendado'))
    compareceu = models.BooleanField(default=False, verbose_name=_('Compareceu'))
    confirmado = models.BooleanField(default=False, verbose_name=_('Confirmado'))
    data_agendamento = models.DateTimeField(verbose_name=_('Data do Agendamento'))
    senha = models.CharField(max_length=10, verbose_name=_('Senha'), null=True, blank=True)

    def __str__(self):
        return f"{self.cliente.username} - {self.servico}"