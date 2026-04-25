import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import { getMessagesBySpace, sendMessageToSpace } from '../../services/messageService';
import useAuthStore from '../../store/useAuthStore';
import { extractErrorMessage } from '../../utils/errorHandler';
import { theme } from '../../utils/theme';

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

export default function ChatScreen({ route }) {
  const spaceId = route.params?.spaceId;
  const spaceName = route.params?.spaceName || 'Chat';
  const user = useAuthStore(state => state.user);
  const listRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');

  const canSend = useMemo(() => !!spaceId && text.trim().length > 0 && !isSending, [spaceId, text, isSending]);

  const scrollToBottom = animated => {
    if (!listRef.current) {
      return;
    }
    listRef.current.scrollToEnd({ animated });
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
    loadMessages();
  }, [spaceId]);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom(true);
    }
  }, [messages]);

  const handleSend = async () => {
    if (!canSend) {
      return;
    }

    const content = text.trim();
    setText('');
    setIsSending(true);

    try {
      const data = await sendMessageToSpace({ spaceId, message: content });
      const newMessage = {
        ...(data?.message || data?.data?.message || data?.data || data || {}),
        message: data?.message?.message || data?.data?.message?.message || data?.message || content,
        sender_name: user?.name || 'You',
      };
      setMessages(prev => [...prev, newMessage]);
    } catch (err) {
      setText(content);
      setError(extractErrorMessage(err, 'Failed to send message.'));
    } finally {
      setIsSending(false);
    }
  };

  const getTimestamp = rawTime => {
    if (!rawTime) {
      return '';
    }

    const parsed = new Date(rawTime);
    if (Number.isNaN(parsed.getTime())) {
      return '';
    }

    return parsed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = ({ item }) => {
    const body = item?.message || item?.text || item?.content || 'Message';
    const sender = item?.sender_name || item?.senderName || item?.sender?.name || 'User';
    const timestamp = getTimestamp(item?.created_at || item?.createdAt || item?.timestamp || item?.sentAt);
    const currentUserId = user?.id || user?.user_id;
    const itemSenderId = item?.sender_id || item?.senderId;
    const isOwnMessage = currentUserId && itemSenderId ? String(currentUserId) === String(itemSenderId) : false;

    return (
      <View style={[styles.messageCard, isOwnMessage && styles.ownMessageCard]}>
        <Text style={[styles.sender, isOwnMessage && styles.ownSender]}>{isOwnMessage ? 'You' : sender}</Text>
        <Text style={styles.messageText}>{body}</Text>
        {!!timestamp && <Text style={styles.timestamp}>{timestamp}</Text>}
      </View>
    );
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>{spaceName}</Text>
      <Text style={styles.subtitle}>Conversation</Text>

      {isLoading ? (
        <View style={styles.centeredState}>
          <ActivityIndicator color={theme.colors.accent} />
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item, index) => String(item?._id || item?.id || `${index}-${item?.message || item?.text || 'm'}`)}
          renderItem={renderMessage}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          onLayout={() => scrollToBottom(false)}
          onContentSizeChange={() => scrollToBottom(false)}
          ListEmptyComponent={<Text style={styles.emptyText}>No messages yet.</Text>}
        />
      )}

      {!!error && <Text style={styles.error}>{error}</Text>}

      <View style={styles.composeRow}>
        <TextInput
          placeholder="Type a message"
          placeholderTextColor="#8AA1C2"
          style={styles.input}
          value={text}
          onChangeText={setText}
          returnKeyType="send"
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity
          style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
          activeOpacity={0.85}
          disabled={!canSend}
          onPress={handleSend}>
          <Text style={styles.sendText}>{isSending ? '...' : 'Send'}</Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 2,
    textAlign: 'center',
  },
  subtitle: {
    color: theme.colors.text,
    opacity: 0.72,
    textAlign: 'center',
    marginBottom: 12,
    fontSize: 13,
  },
  listContent: {
    paddingBottom: 14,
  },
  messageCard: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    backgroundColor: theme.colors.inputBackground,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000000',
    shadowOpacity: 0.14,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  ownMessageCard: {
    borderColor: theme.colors.accent,
  },
  sender: {
    color: theme.colors.accent,
    fontWeight: '700',
    marginBottom: 4,
  },
  ownSender: {
    opacity: 0.95,
  },
  messageText: {
    color: theme.colors.text,
    lineHeight: 20,
  },
  timestamp: {
    color: theme.colors.text,
    opacity: 0.6,
    marginTop: 6,
    fontSize: 12,
  },
  composeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  input: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.inputBackground,
    color: theme.colors.text,
    paddingHorizontal: 14,
  },
  sendButton: {
    width: 72,
    height: 48,
    borderRadius: 12,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendText: {
    color: theme.colors.text,
    fontWeight: '700',
  },
  centeredState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: theme.colors.text,
    opacity: 0.8,
    textAlign: 'center',
    marginTop: 30,
  },
  error: {
    color: theme.colors.danger,
    marginTop: 8,
  },
});
