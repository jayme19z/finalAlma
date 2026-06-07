# Django modules
from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    """Custom user model for Almatour.

    Uses the email field as the primary username identifier.
    """

    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, unique=True)

    # Exclude inherited name fields in favor of single username or profile details
    first_name = None
    last_name = None

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'phone']

    class Meta:
        db_table = 'users_customuser'
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self) -> str:
        return self.email

    is_pro = models.BooleanField(
        default=False,
        verbose_name='Pro plan',
        help_text='Designates whether this user has an active Pro subscription.',
    )
