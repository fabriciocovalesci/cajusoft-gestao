from django import template

register = template.Library()

@register.filter
def getattr(obj, attr):
    """Filtro personalizado para acessar atributos dinamicamente."""
    return getattr(obj, attr, None)


@register.filter
def get_field_value(obj, field_name):
    """Obtém o valor de um campo do objeto usando o nome do campo."""
    return getattr(obj, field_name, None)
