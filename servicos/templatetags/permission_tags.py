from django import template
from django.contrib.auth.models import Group

register = template.Library()

@register.filter(name='has_group')
def has_group(user, group_name):
    """Check if user belongs to a specific group"""
    try:
        group = Group.objects.get(name=group_name)
        return group in user.groups.all()
    except Group.DoesNotExist:
        return False

@register.filter(name='has_permission')
def has_permission(user, permission_name):
    """Check if user has a specific permission"""
    return user.has_perm(permission_name)

@register.simple_tag(name='can_access')
def can_access(user, permission_name=None, group_name=None):
    """Check if user has either the required permission or belongs to the required group"""
    if permission_name and user.has_perm(permission_name):
        return True
    if group_name:
        try:
            group = Group.objects.get(name=group_name)
            return group in user.groups.all()
        except Group.DoesNotExist:
            return False
    return False