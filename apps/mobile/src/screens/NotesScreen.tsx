import React, { useState } from "react";
import {
    Alert,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    View,
} from "react-native";
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
                                    <TextWrapper style={styles.noteText} numberOfLines={4}>
                                        {note.text}
                                    </TextWrapper>
                                ) : null}
                            </Card>
                        </Pressable>
                    );
                })}
            </Screen>

            <Modal
                visible={popupVisible}
                animationType="slide"
                transparent
                onRequestClose={closePopup}
            >
                <View style={styles.modalContainer}>
                    <Pressable style={{ flex: 1 }} onPress={closePopup} />
                    <View style={styles.sheet}>
                        <View style={styles.sheetHandle} />
                        <ScrollView contentContainerStyle={{ paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
                            <TextWrapper variant="title" style={styles.modalTitle}>
                                {editingId === null ? "Новая запись" : "Редактировать запись"}
                            </TextWrapper>

                            <TextWrapper style={styles.label}>Название</TextWrapper>
                            <TextInput
                                style={styles.input}
                                value={title}
                                onChangeText={setTitle}
                                placeholder="Название"
                                placeholderTextColor="#666"
                                maxLength={100}
                            />

                            <TextWrapper style={styles.label}>Дата</TextWrapper>
                            <TextInput
                                style={styles.input}
                                value={dateStr}
                                onChangeText={setDateStr}
                                placeholder="дд.мм.гггг"
                                placeholderTextColor="#666"
                                keyboardType="numbers-and-punctuation"
                                maxLength={10}
                            />

                            <TextWrapper style={styles.label}>Эмоция</TextWrapper>
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

                            <TextWrapper style={styles.label}>Текст</TextWrapper>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={text}
                                onChangeText={setText}
                                placeholder="Что на душе?"
                                placeholderTextColor="#666"
                                multiline
                            />

                            <View style={styles.modalButtons}>
                                <Button variant="secondary" onPress={closePopup}>
                                    Отмена
                                </Button>
                                <Button variant="primary" onPress={handleSave}>
                                    Сохранить
                                </Button>
                            </View>

                            {editingId !== null && (
                                <Pressable onPress={handleDelete} style={styles.deleteLink}>
                                    <TextWrapper style={styles.deleteLinkText}>Удалить запись</TextWrapper>
                                </Pressable>
                            )}
                        </ScrollView>
                    </View>
                </View>
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

    // Modal
    modalContainer: {
        flex: 1,
        backgroundColor: "#000000aa",
    },
    sheet: {
        maxHeight: "88%",
        backgroundColor: colors.background,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 24,
        paddingTop: 12,
        borderTopWidth: 1,
        borderColor: colors.secondary + "44",
    },
    sheetHandle: {
        alignSelf: "center",
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: "#ffffff33",
        marginBottom: 12,
    },
    modalTitle: {
        marginBottom: 16,
        textAlign: "left",
    },
    label: {
        color: "#aaa",
        fontSize: 13,
        marginBottom: 6,
        marginTop: 4,
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
        minHeight: 100,
        textAlignVertical: "top",
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
    modalButtons: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 12,
        marginTop: 16,
    },
    deleteLink: {
        marginTop: 18,
        alignSelf: "center",
    },
    deleteLinkText: {
        color: colors.danger,
        fontSize: 14,
    },
});
