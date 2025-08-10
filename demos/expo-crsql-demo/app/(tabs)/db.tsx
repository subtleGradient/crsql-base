import { useState } from "react";
import { 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl 
} from "react-native";

import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText as Text } from "@/components/ThemedText";
import { ThemedView as View } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useDatabase, useTodos } from "@/hooks/useDatabase";

export default function TabTwoScreen() {
  const { isInitialized, siteId, dbVersion, refreshDbVersion } = useDatabase();
  const { todos, loading, error, addTodo, toggleTodo, deleteTodo, refresh } = useTodos();
  const [newTodoText, setNewTodoText] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleAddTodo = async () => {
    if (!newTodoText.trim()) return;
    await addTodo(newTodoText.trim());
    setNewTodoText("");
    await refreshDbVersion();
  };

  const handleToggle = async (id: string) => {
    await toggleTodo(id);
    await refreshDbVersion();
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      "Delete Todo",
      "Are you sure you want to delete this todo?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            await deleteTodo(id);
            await refreshDbVersion();
          }
        },
      ]
    );
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refresh();
    await refreshDbVersion();
    setIsRefreshing(false);
  };

  if (!isInitialized) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <Text>Initializing CR-SQLite...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <IconSymbol name="exclamationmark.triangle" size={48} color="#ff0000" />
        <Text style={styles.errorText}>Database Error</Text>
        <Text>{error.message}</Text>
      </View>
    );
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="network"
          style={styles.headerImage}
        />
      }
    >
      <View style={styles.titleContainer}>
        <Text type="title">CR-SQLite Demo</Text>
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>Site ID: {siteId.substring(0, 8)}...</Text>
        <Text style={styles.infoText}>DB Version: {dbVersion}</Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add a new todo..."
          value={newTodoText}
          onChangeText={setNewTodoText}
          onSubmitEditing={handleAddTodo}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddTodo}>
          <IconSymbol name="plus.circle.fill" size={32} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.todoList}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        {loading && todos.length === 0 ? (
          <ActivityIndicator style={styles.loader} />
        ) : todos.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol name="tray" size={48} color="#808080" />
            <Text style={styles.emptyText}>No todos yet</Text>
            <Text style={styles.emptySubtext}>Add one above to get started!</Text>
          </View>
        ) : (
          todos.map((todo) => (
            <View key={todo.id} style={styles.todoItem}>
              <TouchableOpacity 
                style={styles.todoContent}
                onPress={() => handleToggle(todo.id)}
              >
                <IconSymbol 
                  name={todo.completed ? "checkmark.circle.fill" : "circle"}
                  size={24}
                  color={todo.completed ? "#34C759" : "#808080"}
                />
                <Text 
                  style={[
                    styles.todoText,
                    todo.completed && styles.completedText
                  ]}
                >
                  {todo.text}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(todo.id)}>
                <IconSymbol name="trash" size={20} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      <View style={styles.section}>
        <Text type="subtitle">About CR-SQLite</Text>
        <Text style={styles.description}>
          This demo showcases CR-SQLite (Conflict-free Replicated SQLite), 
          which enables multi-writer replication and automatic conflict resolution 
          using CRDTs (Conflict-free Replicated Data Types).
        </Text>
        <Text style={styles.description}>
          Each change is tracked with a version number, and the database can 
          sync changes bidirectionally with other instances while automatically 
          resolving conflicts.
        </Text>
      </View>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: "#808080",
    bottom: -90,
    left: -35,
    position: "absolute",
  },
  titleContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "#ff0000",
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
  },
  infoContainer: {
    backgroundColor: "rgba(0, 122, 255, 0.1)",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 12,
    opacity: 0.7,
    fontFamily: "SpaceMono",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  addButton: {
    padding: 4,
  },
  todoList: {
    maxHeight: 300,
    marginBottom: 20,
  },
  loader: {
    marginVertical: 20,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 10,
    opacity: 0.7,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 5,
    opacity: 0.5,
  },
  todoItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  todoContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  todoText: {
    fontSize: 16,
    flex: 1,
  },
  completedText: {
    textDecorationLine: "line-through",
    opacity: 0.5,
  },
  section: {
    marginTop: 20,
  },
  description: {
    marginTop: 8,
    opacity: 0.8,
    lineHeight: 20,
  },
});