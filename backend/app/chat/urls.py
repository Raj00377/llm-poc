from django.urls import path
from . import views

urlpatterns = [
    # Auth
    path("auth/register/",          views.RegisterView.as_view()),
    path("auth/login/",             views.LoginView.as_view()),
    path("auth/logout/",            views.LogoutView.as_view()),
    path("auth/me/",                views.MeView.as_view()),

    # Conversations
    path("conversations/",          views.ConversationListView.as_view()),
    path("conversations/<uuid:conv_id>/", views.ConversationDetailView.as_view()),

    # Chat (streaming)
    path("chat/<uuid:conv_id>/",    views.ChatView.as_view()),

    # Preferences
    path("preferences/",            views.PreferencesView.as_view()),

    # Memories
    path("memories/",               views.MemoriesView.as_view()),
    path("memories/<uuid:memory_id>/", views.MemoriesView.as_view()),
    path("feedback/", views.FeedbackView.as_view()),
]
