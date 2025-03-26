from datetime import datetime, timedelta
import json
from django.db import models
from django.utils.translation import gettext_lazy as _
from servicos.models import Servico
from django.contrib.auth.models import User
from django.urls import reverse
from django.utils.text import slugify

class Agendamento(models.Model):
    servico = models.ForeignKey(Servico, on_delete=models.PROTECT, verbose_name=_('Serviço'))
    data = models.DateField(verbose_name=_('Data'), default=datetime.now)
    vagas = models.PositiveIntegerField(verbose_name=_('Vagas'), default=1)
    slug = models.SlugField(unique=True, blank=True, null=True)

    class Meta:
        unique_together = ['atributo', 'data']
    hora_inicio = models.TimeField(verbose_name=_('Hora de Início'), default=datetime.now)
    hora_fim = models.TimeField(verbose_name=_('Hora de Fim'), default=datetime.now)
    atributo = models.CharField(max_length=100, verbose_name=_('Atributo'), blank=True, null=True)
    intervalo = models.PositiveIntegerField(verbose_name=_('Intervalo'), default=30)
    horarios_disponiveis = models.JSONField(verbose_name=_('Horários disponíveis'), blank=True, default=list)
    usuario = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name=_('Usuário'))
    prioritario = models.BooleanField(default=False, verbose_name=_('Prioritário'), blank=True, null=True)
    status = models.CharField(max_length=20, choices=[
        ('disponivel', _('Disponível')),
        ('agendado', _('Agendado')),
        ('confirmado', _('Confirmado')),
        ('cancelado', _('Cancelado')),
        ('concluido', _('Concluído')),
    ], default='disponivel', verbose_name=_('Status'))
    criado_em = models.DateTimeField(auto_now_add=True, verbose_name=_('Criado em'))
    atualizado_em = models.DateTimeField(auto_now=True, verbose_name=_('Atualizado em'))

    # def calcular_horarios_disponiveis(self):
    #     horarios = []
    #     hora_atual = datetime.combine(self.data, self.hora_inicio)
    #     hora_fim_dt = datetime.combine(self.data, self.hora_fim)

    #     while hora_atual < hora_fim_dt:
    #         horarios.append({
    #             "hora_agenda": hora_atual.strftime("%H:%M"),
    #             "status": True
    #         })
    #         hora_atual += timedelta(minutes=self.intervalo)

    #     self.horarios_disponiveis = json.dumps(horarios, ensure_ascii=False)


    def calcular_horarios_disponiveis(self):
        """Calcula os horários disponíveis com base na hora de início, intervalo e vagas."""
        horarios = []
        hora_atual = datetime.combine(self.data, self.hora_inicio)

        for _ in range(self.vagas):
            horarios.append({
                "hora_agenda": hora_atual.strftime("%H:%M"),
                "status": True
            })
            hora_atual += timedelta(minutes=self.intervalo)

        self.horarios_disponiveis = json.dumps(horarios, ensure_ascii=False)
        self.hora_fim = hora_atual.time()


    def save(self, *args, **kwargs):
        data_formatada = self.data.strftime('%d-%m-%Y')
        if self.servico.nome == "Cadastro Único":
            self.slug = slugify(f"Cadastro Único-{data_formatada}")
        else:
            base_slug = slugify(f"{self.atributo}-{data_formatada}")
            self.slug = base_slug

        # if Agendamento.objects.filter(slug=self.slug).exists():
        #     raise ValueError(f"Já existe um agendamento com o slug: {self.slug}")

        if self.pk is None:
            self.calcular_horarios_disponiveis()
            
        super().save(*args, **kwargs)
        print("Agendamento salvo com sucesso!")

    def __str__(self):
        return f"{self.servico} - {self.data}"
    

    def get_absolute_url(self):
        return reverse('agendamento:agendamento_detail', kwargs={'slug': self.slug})
