# Generated by Django 5.1.6 on 2025-03-20 10:58

import datetime
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('servicos', '0009_servicos_delete_agendamento'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Agendamento',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('data', models.DateField(default=datetime.datetime.now, verbose_name='Data')),
                ('vagas', models.PositiveIntegerField(default=1, verbose_name='Vagas')),
                ('hora_inicio', models.TimeField(default=datetime.datetime.now, verbose_name='Hora de Início')),
                ('hora_fim', models.TimeField(default=datetime.datetime.now, verbose_name='Hora de Fim')),
                ('intervalo', models.PositiveIntegerField(default=30, verbose_name='Intervalo')),
                ('horarios_disponiveis', models.JSONField(blank=True, default=list, verbose_name='Horários disponíveis')),
                ('status', models.CharField(choices=[('disponivel', 'Disponível'), ('agendado', 'Agendado'), ('confirmado', 'Confirmado'), ('cancelado', 'Cancelado'), ('concluido', 'Concluído')], default='disponivel', max_length=20, verbose_name='Status')),
                ('criado_em', models.DateTimeField(auto_now_add=True, verbose_name='Criado em')),
                ('atualizado_em', models.DateTimeField(auto_now=True, verbose_name='Atualizado em')),
                ('servico', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='servicos.servico', verbose_name='Serviço')),
                ('usuario', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL, verbose_name='Usuário')),
            ],
            options={
                'unique_together': {('servico', 'data')},
            },
        ),
    ]
