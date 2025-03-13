from django import template

register = template.Library()

@register.filter
def has_role(user, roles):
    """Check if user has any of the specified roles.
    Usage: {% if user|has_role:'admin,secretary,interviewer' %}
    """
    if not user.is_authenticated:
        return False
    
    if not hasattr(user, 'userprofile'):
        return False
        
    user_role = user.userprofile.role
    allowed_roles = [role.strip() for role in roles.split(',')]
    return user_role in allowed_roles