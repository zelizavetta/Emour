import React, { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card/card";
import Screen from "@/components/ui/screen";
import TextWrapper from "@/components/ui/textWrapper";
import { colors } from "@/constants/colors";
import { formatDateTime } from "@/utils/time";
import { useUserRecords } from "@/providers/UserContext";
import { Note, EmotionType, EMOTIONS, emotionPolarity } from "@emour/core";

const DATE_RE = /^(\d{2})\.(\d{2})\.(\d{4})$/;
const deviceTz = Intl.DateTimeFormat().resolvedOptions().timeZone;

const pad = (n: number) => String(n).padStart(2, "0");

function todayStr(): string {
    const n = new Date();
    return `${pad(n.getDate())}.${pad(n.getMonth() + 1)}.${n.getFullYear()}`;
}

function isoToDateStr(iso: string, tz: string): string {
    const [y, m, d] = formatDateTime(iso, tz).slice(0, 10).split("-");
    return `${d}.${m}.${y}`;
}

function isoToTimeOfDay(iso: string, tz: string) {
    const [hh, mm, ss] = formatDateTime(iso, tz).slice(11).split(":").map(Number);
    return { hh, mm, ss };
}

// Combine a "DD.MM.YYYY" string + a time-of-day into a UTC ISO instant using
// the device's local timezone, which is what gets stored as clientTimezone.
function buildIso(dateStr: string, tod: { hh: number; mm: number; ss: number }): string | null {
    const m = DATE_RE.exec(dateStr.trim());
    if (!m) return null;
    const d = Number(m[1]);
    const mo = Number(m[2]);
    const y = Number(m[3]);
    const dt = new Date(y, mo - 1, d, tod.hh, tod.mm, tod.ss);
    if (isNaN(dt.getTime())) return null;
    if (dt.getDate() !== d || dt.getMonth() !== mo - 1) return null; // reject 31.02 etc.
    return dt.toISOString();
}

function emotionMeta(value: EmotionType) {
    return EMOTIONS.find(e => e.value === value);
}

function highlightColor(value: EmotionType): string {
    return emotionPolarity(value) === "positive" ? colors.green : colors.danger;
}

export default function NotesScreen() {
    const { notes, addNote, updateNote, deleteNote, refresh } = useUserRecords();

    const [popupVisible, setPopupVisible] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [title, setTitle] = useState("");
    const [text, setText] = useState("");
    const [emotion, setEmotion] = useState<EmotionType>("joy");
    const [dateStr, setDateStr] = useState(todayStr());
    // Preserve time-of-day so editing only the date doesn't zero the clock.
    const [timeOfDay, setTimeOfDay] = useState({ hh: 12, mm: 0, ss: 0 });

    function openCreate() {
        const now = new Date();
        setEditingId(null);
        setTitle("");
        setText("");
        setEmotion("joy");
        setDateStr(todayStr());
        setTimeOfDay({ hh: now.getHours(), mm: now.getMinutes(), ss: now.getSeconds() });
        setPopupVisible(true);
    }

    function openEdit(note: Note) {
        setEditingId(note.id);
        setTitle(note.title);
        setText(note.text);
        setEmotion(note.emotion);
        setDateStr(isoToDateStr(note.createdAtClient, note.clientTimezone));
        setTimeOfDay(isoToTimeOfDay(note.createdAtClient, note.clientTimezone));
        setPopupVisible(true);
    }

    function closePopup() {
        setPopupVisible(false);
    }

    async function handleSave() {
        if (!title.trim()) {
            Alert.alert("Укажите название записи");
            return;
        }
        const iso = buildIso(dateStr, timeOfDay);
        if (!iso) {
            Alert.alert("Неверная дата", "Введите дату в формате дд.мм.гггг");
            return;
        }
        setPopupVisible(false);
        if (editingId === null) {
            await addNote(title.trim(), text.trim(), emotion, iso, deviceTz);
        } else {
            await updateNote(editingId, title.trim(), text.trim(), emotion, iso, deviceTz);
        }
    }

    function handleDelete() {
        if (editingId === null) return;
        const id = editingId;
        Alert.alert("Удалить запись", "Удалить эту запись?", [
            { text: "Отмена", style: "cancel" },
            {
                text: "Удалить",
                style: "destructive",
                onPress: () => {
                    setPopupVisible(false);
                    deleteNote(id);
                },
            },
        ]);
    }

    return (
        <>
            <Screen onRefresh={refresh}>
                <TextWrapper variant="bigTitle">Дневник</TextWrapper>

                <Button variant="secondary" style={styles.addButton} onPress={openCreate}>
                    + Запись
                </Button>

                {notes.length === 0 && (
                    <TextWrapper style={styles.empty}>Пока нет записей</TextWrapper>
                )}

                {notes.map(note => {
                    const meta = emotionMeta(note.emotion);
                    const accent = highlightColor(note.emotion);
                    return (
                        <Pressable key={note.id} onPress={() => openEdit(note)}>
                            <Card style={[styles.noteCard, { borderLeftColor: accent, backgroundColor: accent + "14" }]}>
                                <View style={styles.noteHeader}>
                                    <TextWrapper variant="title" style={styles.noteTitle}>
                                        {note.title}
                                    </TextWrapper>
                                    <TextWrapper style={styles.noteDate}>
                                        {isoToDateStr(note.createdAtClient, note.clientTimezone)}
                                    </TextWrapper>
                                </View>
                                {meta && (
                                    <View style={[styles.emotionBadge, { borderColor: accent }]}>
                                        <TextWrapper style={styles.emotionBadgeText}>
                                            {meta.emoji} {meta.label}
                                        </TextWrapper>
                                    </View>
                                )}
                                {note.text ? (
                                    <TextWrapper style={styles.noteText}>
                                        {note.text}
                                    </TextWrapper>
                                ) : null}
                                <LinearGradient
                                    colors={[colors.background + "00", colors.background]}
                                    style={styles.noteFade}
                                    pointerEvents="none"
                                />
                            </Card>
                        </Pressable>
                    );
                })}
            </Screen>

            <Modal
                visible={popupVisible}
                animationType="slide"
                onRequestClose={closePopup}
            >
                <SafeAreaView style={styles.fullScreen} edges={["top", "bottom"]}>
                    <KeyboardAvoidingView
                        style={styles.fullScreen}
                        behavior={Platform.OS === "ios" ? "padding" : undefined}
                    >
                        <View style={styles.editorHeader}>
                            <TextWrapper variant="title" style={styles.modalTitle}>
                                {editingId === null ? "Новая запись" : "Редактировать запись"}
                            </TextWrapper>
                            <Pressable onPress={closePopup} hitSlop={12} style={styles.closeBtn}>
                                <TextWrapper style={styles.closeBtnText}>×</TextWrapper>
                            </Pressable>
                        </View>

                        <View style={styles.editorTop}>
                            <TextInput
                                style={styles.input}
                                value={title}
                                onChangeText={setTitle}
                                placeholder="Название"
                                placeholderTextColor="#666"
                                maxLength={100}
                            />

                            <TextInput
                                style={styles.input}
                                value={dateStr}
                                onChangeText={setDateStr}
                                placeholder="дд.мм.гггг"
                                placeholderTextColor="#666"
                                keyboardType="numbers-and-punctuation"
                                maxLength={10}
                            />

                            <View style={styles.emotionGrid}>
                                {EMOTIONS.map(opt => {
                                    const active = emotion === opt.value;
                                    const accent = opt.polarity === "positive" ? colors.green : colors.danger;
                                    return (
                                        <Pressable
                                            key={opt.value}
                                            onPress={() => setEmotion(opt.value)}
                                            style={[
                                                styles.emotionChip,
                                                { borderColor: accent },
                                                active && { backgroundColor: accent + "33" },
                                            ]}
                                        >
                                            <TextWrapper style={styles.emotionChipText}>
                                                {opt.emoji} {opt.label}
                                            </TextWrapper>
                                        </Pressable>
                                    );
                                })}
                            </View>
                        </View>

                        <TextInput
                            style={styles.textArea}
                            value={text}
                            onChangeText={setText}
                            placeholder="Что на душе?"
                            placeholderTextColor="#666"
                            multiline
                            textAlignVertical="top"
                        />

                        <View style={styles.editorFooter}>
                            {editingId !== null && (
                                <Pressable onPress={handleDelete} style={styles.deleteLink}>
                                    <TextWrapper style={styles.deleteLinkText}>Удалить</TextWrapper>
                                </Pressable>
                            )}
                            <View style={styles.footerButtons}>
                                <Button variant="secondary" onPress={closePopup}>
                                    Отмена
                                </Button>
                                <Button variant="primary" onPress={handleSave}>
                                    Сохранить
                                </Button>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </SafeAreaView>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    addButton: {
        marginBottom: 8,
    },
    empty: {
        color: "#666",
        marginTop: 32,
        textAlign: "center",
    },
    noteCard: {
        marginBottom: 12,
        borderLeftWidth: 4,
        maxHeight: 150,
        overflow: "hidden",
    },
    noteHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 8,
    },
    noteTitle: {
        flex: 1,
        marginBottom: 0,
        textAlign: "left",
    },
    noteDate: {
        color: "#aaa",
        fontSize: 13,
    },
    emotionBadge: {
        alignSelf: "flex-start",
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 3,
        marginTop: 8,
    },
    emotionBadgeText: {
        fontSize: 13,
        color: colors.text,
    },
    noteText: {
        marginTop: 10,
        textAlign: "left",
        color: "#ddd",
        fontSize: 14,
    },
    noteFade: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: 44,
    },

    // Full-screen editor
    fullScreen: {
        flex: 1,
        backgroundColor: colors.background,
    },
    editorHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 24,
        paddingTop: 8,
    },
    closeBtn: {
        padding: 4,
    },
    closeBtnText: {
        fontSize: 30,
        lineHeight: 32,
        color: colors.text,
    },
    editorTop: {
        paddingHorizontal: 24,
    },
    modalTitle: {
        marginBottom: 0,
        textAlign: "left",
    },
    input: {
        backgroundColor: "#ffffff0f",
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 10,
        color: colors.text,
        marginBottom: 10,
        fontSize: 15,
        borderWidth: 1,
        borderColor: "#ffffff11",
    },
    textArea: {
        flex: 1,
        marginHorizontal: 24,
        marginTop: 4,
        marginBottom: 12,
        backgroundColor: "#ffffff0f",
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        color: colors.text,
        fontSize: 16,
        lineHeight: 22,
        borderWidth: 1,
        borderColor: "#ffffff11",
    },
    emotionGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 10,
    },
    emotionChip: {
        borderWidth: 1,
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    emotionChipText: {
        fontSize: 13,
        color: colors.text,
    },
    editorFooter: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 24,
        paddingBottom: 8,
        gap: 12,
    },
    footerButtons: {
        flexDirection: "row",
        gap: 12,
        marginLeft: "auto",
    },
    deleteLink: {
        paddingVertical: 8,
    },
    deleteLinkText: {
        color: colors.danger,
        fontSize: 14,
    },
});
