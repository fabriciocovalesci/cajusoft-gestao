# Generated by Django 5.1.6 on 2025-03-22 14:52

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('agendamento', '0002_agendamento_atributo'),
    ]

    operations = [
        migrations.AddField(
            model_name='agendamento',
            name='slug',
            field=models.SlugField(blank=True, unique=True),
        ),
    ]
