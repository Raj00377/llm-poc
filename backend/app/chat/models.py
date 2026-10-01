import uuid
from django.db import models
from django.contrib.auth.models import User


class UserPreference(models.Model):
    TONE_CHOICES = [
        ("balanced",  "Balanced"),
        ("concise",   "Concise"),
        ("detailed",  "Detailed"),
        ("casual",    "Casual"),
        ("formal",    "Formal"),
    ]

    user       = models.OneToOneField(User, on_delete=models.CASCADE, related_name="preferences")
    tone       = models.CharField(max_length=50, choices=TONE_CHOICES, default="balanced")
    language   = models.CharField(max_length=50, default="English")
    profession = models.CharField(max_length=100, blank=True)
    extra      = models.JSONField(default=dict, blank=True)

    class Meta:
        db_table = "user_preferences"

    def __str__(self):
        return f"{self.user.username} preferences"


class Conversation(models.Model):
    id         = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user       = models.ForeignKey(User, on_delete=models.CASCADE, related_name="conversations")
    title      = models.CharField(max_length=255, blank=True, default="New Chat")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "conversations"
        ordering = ["-updated_at"]

    def __str__(self):
        return f"{self.user.username} — {self.title}"


class Message(models.Model):
    ROLE_CHOICES = [("user", "User"), ("assistant", "Assistant")]

    id           = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name="messages")
    role         = models.CharField(max_length=20, choices=ROLE_CHOICES)
    content      = models.TextField()
    created_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "messages"
        ordering = ["created_at"]

    def __str__(self):
        return f"[{self.role}] {self.content[:60]}"


class Memory(models.Model):
    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user        = models.ForeignKey(User, on_delete=models.CASCADE, related_name="memories")
    fact        = models.TextField()
    importance  = models.IntegerField(default=5)        # 1 (low) – 10 (high)
    source_conv = models.ForeignKey(Conversation, null=True, blank=True, on_delete=models.SET_NULL)
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "memories"
        ordering = ["-importance", "-created_at"]

    def __str__(self):
        return f"{self.user.username}: {self.fact[:80]}"
