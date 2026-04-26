import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TextInput, View, Vibration } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import PressableScale from '../../components/PressableScale';
import SkeletonBlock from '../../components/SkeletonBlock';
import { getMessagesBySpace, sendMessageToSpace } from '../../services/messageService';
import useAuthStore from '../../store/useAuthStore';
import useSpaceStore from '../../store/useSpaceStore';
import useThemeStore from '../../store/useThemeStore';
import { extractErrorMessage } from '../../utils/errorHandler';
import { resolveTheme } from '../../utils/theme';

const normalizeMessages = payload => {
  if (Array.isArray(payload)) {
    return payload;
  }
  if (Array.isArray(payload?.messages)) {
    return payload.messages;
  }
  if (Array.isArray(payload?.data?.messages)) {
    return payload.data.messages;
  }
  if (Array.isArray(payload?.data)) {
    return payload.data;
  }
  return [];
};

export default function ChatScreen({ route, navigation }) {
  const routeSpaceId = route.params?.spaceId;
  const routeSpaceName = route.params?.spaceName || 'Chat';
  const user = useAuthStore(state => state.user);
  const currentSpace = useSpaceStore(state => state.currentSpace);
  const isDarkMode = useThemeStore(state => state.isDarkMode);
  const appTheme = resolveTheme(isDarkMode);
  const listRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const spaceId = currentSpace?._id || currentSpace?.id || routeSpaceId;
  const spaceName = currentSpace?.name || routeSpaceName;

  const canSend = useMemo(() => !!spaceId && text.trim().length > 0 && !isSending, [spaceId, text, isSending]);

  const scrollToBottom = animated => {
    listRef.current?.scrollToEnd?.({ animated });
  };

  const loadMessages = async () => {
    if (!spaceId) {
      setError('Space ID is missing.');
      setIsLoading(false);
      return;
    }

    setError('');
    setIsLoading(true);
    try {
      const data = await getMessagesBySpace(spaceId);
      setMessages(normalizeMessages(data));
    } catch (err) {
      setError(extractErrorMessage(err, 'Unable to load messages right now.'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    navigation.setOptions?.({ title: spaceName });
    loadMessages().catch(() => {});
  }, [spaceId, spaceName]);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom(true);
    }
  }, [messages]);

  const refreshMessages = async () => {
    setRefreshing(true);
    try {
      await loadMessages();
    } finally {
      setRefreshing(false);
    }
  };

  const handleSend = async () => {
    if (!canSend) {
      return;
    }

    const content = text.trim();
    setText('');
    setIsSending(true);
    Vibration.vibrate(10);

    try {
      const data = await sendMessageToSpace({ spaceId, message: content });
      const newMessage = {
        ...(data?.message || data?.data?.message || data?.data || data || {}),
        message: data?.message?.message || data?.data?.message?.message || data?.message || content,
        sender_name: user?.name || 'You',
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, newMessage]);
      scrollToBottom(true);
    } catch (err) {
      setText(content);
      setError(extractErrorMessage(err, 'Failed to send message.'));
    } finally {
      setIsSending(false);
    }
  };

  const renderMessage = ({ item }) => {
    const body = item?.message || item?.text || item?.content || 'Message';
    const sender = item?.sender_name || item?.senderName || item?.sender?.name || 'User';
    const currentUserId = user?.id || user?.user_id;
    const itemSenderId = item?.sender_id || item?.senderId;
    const isOwnMessage = currentUserId && itemSenderId ? String(currentUserId) === String(itemSenderId) : sender === user?.name;
    const timestamp = item?.created_at || item?.createdAt || item?.timestamp || item?.sentAt;

    return (
      <View style={[styles.bubble, isOwnMessage ? styles.ownBubble : styles.otherBubble, { backgroundColor: isOwnMessage ? appTheme.colors.accent : appTheme.colors.surface, borderColor: appTheme.colors.border }]}>
        <Text style={[styles.sender, { color: isOwnMessage ? '#FFFFFF' : appTheme.colors.accent }]}>{isOwnMessage ? 'You' : sender}</Text>
        <Text style={[styles.messageText, { color: isOwnMessage ? '#FFFFFF' : appTheme.colors.text }]}>{body}</Text>
        {!!timestamp && <Text style={[styles.timestamp, { color: isOwnMessage ? 'rgba(255,255,255,0.78)' : appTheme.colors.muted }]}>{new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>}
      </View>
    );
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={[styles.title, { color: appTheme.colors.text }]}>{spaceName}</Text>
        <Text style={[styles.subtitle, { color: appTheme.colors.muted }]}>Simple, rounded, fast.</Text>
      </View>

      {isLoading ? (
        <SkeletonBlock style={styles.skeletonList} />
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item, index) => String(item?._id || item?.id || `${index}-${item?.message || 'm'}`)}
          renderItem={renderMessage}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refreshMessages} tintColor={appTheme.colors.accent} />}
          onLayout={() => scrollToBottom(false)}
          onContentSizeChange={() => scrollToBottom(false)}
          ListEmptyComponent={<Text style={[styles.emptyText, { color: appTheme.colors.muted }]}>No messages yet.</Text>}
        />
      )}

      {!!error && <Text style={[styles.error, { color: appTheme.colors.danger }]}>{error}</Text>}

      <View style={[styles.composeRow, { borderTopColor: appTheme.colors.border }]}>
        <TextInput
          placeholder="Type a message"
          placeholderTextColor={appTheme.colors.muted}
          style={[styles.input, { backgroundColor: appTheme.colors.surface, color: appTheme.colors.text, borderColor: appTheme.colors.border }]}
          value={text}
          onChangeText={setText}
          returnKeyType="send"
          onSubmitEditing={handleSend}
        />
        <PressableScale onPress={handleSend} disabled={!canSend} style={[styles.sendButton, !canSend && styles.sendButtonDisabled, { backgroundColor: appTheme.colors.accent }]}>
          <Text style={styles.sendText}>{isSending ? '...' : 'Send'}</Text>
        </PressableScale>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 12,
  },
  listContent: {
    paddingBottom: 12,
  },
  bubble: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    maxWidth: '86%',
  },
  ownBubble: {
    alignSelf: 'flex-end',
    borderTopRightRadius: 8,
  },
  otherBubble: {
    alignSelf: 'flex-start',
    borderTopLeftRadius: 8,
  },
  sender: {
    fontWeight: '800',
    marginBottom: 4,
  },
  messageText: {
    lineHeight: 20,
  },
  timestamp: {
    marginTop: 6,
    fontSize: 11,
  },
  composeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
  },
  sendButton: {
    height: 48,
    minWidth: 74,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.55,
  },
  sendText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  error: {
    marginTop: 8,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
  },
  skeletonList: {
    height: 320,
  },
});