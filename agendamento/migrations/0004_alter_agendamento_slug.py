# Generated by Django 5.1.6 on 2025-03-22 14:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('agendamento', '0003_agendamento_slug'),
    ]

    operations = [
        migrations.AlterField(
            model_name='agendamento',
            name='slug',
            field=models.SlugField(blank=True, null=True, unique=True),
        ),
    ]
