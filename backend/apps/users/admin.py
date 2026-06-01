from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from unfold.admin import ModelAdmin

from apps.users.models import CustomUser


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin, ModelAdmin):
    """Admin configuration for CustomUser."""

    list_display = ('email', 'username', 'phone', 'is_pro', 'is_active', 'is_superuser', 'date_joined')
    list_filter = ('is_pro', 'is_active', 'is_superuser')
    search_fields = ('email', 'username', 'phone')
    ordering = ('-date_joined',)

    fieldsets = (
        (None, {'fields': ('email', 'username', 'phone', 'password')}),
        ('Subscription', {'fields': ('is_pro',)}),
        ('Permissions', {'fields': ('is_active', 'is_superuser')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'phone', 'password1', 'password2'),
        }),
    )
