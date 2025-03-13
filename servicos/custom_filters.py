from django import template

register = template.Library()

@register.filter
def getattr(obj, attr):
    """Filtro personalizado para acessar atributos dinamicamente."""
    return getattr(obj, attr, None)