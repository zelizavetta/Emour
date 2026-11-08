import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import Button from '@/components/ui/button';
import Card from '@/components/ui/card/card';
import Screen from '@/components/ui/screen';
import TextWrapper from '@/components/ui/textWrapper';
import { colors } from '@/constants/colors';
import { Med, WEEKDAY_LABELS, ALL_WEEKDAYS } from '@emour/core';
import { useMeds } from '@/providers/MedsProvider';

const pad = (n: number) => String(n).padStart(2, '0');

// Returns true if any scheduled time for this med was within the last 60 minutes today.
function isOverdue(med: Med, takenToday: Set<number>): boolean {
  if (!med.enabled) return false;
  if (takenToday.has(med.id)) return false;

  const now = new Date();
  const todayWeekday = now.getDay() === 0 ? 7 : now.getDay();
  const days = med.days ?? [1, 2, 3, 4, 5, 6, 7];
  if (!days.includes(todayWeekday)) return false;

  const minutesNow = now.getHours() * 60 + now.getMinutes();
  for (const time of med.times) {
    const [h, m] = time.split(':').map(Number);
    const diff = minutesNow - (h * 60 + m);
    if (diff >= 0 && diff <= 60) return true;
  }
  return false;
}

export default function MedsScreen() {
  const { meds, addMed, removeMed, toggleMed, confirmTaken, takenToday, refresh } = useMeds();

  // Tick every minute so "Принял" button appears/disappears at the right time.
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  const [popupVisible, setPopupVisible] = useState(false);
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [times, setTimes] = useState<string[]>([]);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [days, setDays] = useState<number[]>([...ALL_WEEKDAYS]);

  function resetForm() {
    setName('');
    setDosage('');
    setTimes([]);
    setShowTimePicker(false);
    setDays([...ALL_WEEKDAYS]);
  }

  function toggleDay(value: number) {
    setDays(prev =>
      prev.includes(value)
        ? prev.length > 1 ? prev.filter(d => d !== value) : prev
        : [...prev, value],
    );
  }

  function onTimePicked(event: { type: string }, selected?: Date) {
    setShowTimePicker(false);
    if (event.type !== 'set' || !selected) return;
    const value = `${pad(selected.getHours())}:${pad(selected.getMinutes())}`;
    setTimes(prev => (prev.includes(value) ? prev : [...prev, value].sort()));
  }

  function handleRemoveTime(t: string) {
    setTimes(prev => prev.filter(x => x !== t));
  }

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert('Укажите название лекарства');
      return;
    }
    if (times.length === 0) {
      Alert.alert('Добавьте хотя бы одно время приёма');
      return;
    }
    setPopupVisible(false);
    await addMed(name.trim(), dosage.trim(), times, days);
    resetForm();
  }

  function handleDelete(id: number, medName: string) {
    Alert.alert(
      'Удалить лекарство',
      `Удалить "${medName}" и все уведомления?`,
      [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Удалить', style: 'destructive', onPress: () => removeMed(id) },
      ],
    );
  }

  return (
    <>
      <Screen onRefresh={refresh}>
        <TextWrapper variant="bigTitle">Таблетки</TextWrapper>

        <Button
          variant="secondary"
          style={styles.addButton}
          onPress={() => setPopupVisible(true)}
        >
          + Добавить лекарство
        </Button>

        {meds.length === 0 && (
          <TextWrapper style={styles.empty}>
            Нет добавленных лекарств
          </TextWrapper>
        )}

        {meds.map(med => (
          <Card key={med.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardInfo}>
                <TextWrapper variant="title">{med.name}</TextWrapper>
                {med.dosage ? (
                  <TextWrapper style={styles.dosage}>{med.dosage}</TextWrapper>
                ) : null}
              </View>
              <View style={styles.cardActions}>
                <Switch
                  value={med.enabled}
                  onValueChange={() => toggleMed(med.id)}
                  trackColor={{ false: '#555', true: colors.secondary }}
                  thumbColor={med.enabled ? colors.primary : '#aaa'}
                />
                <Pressable
                  onPress={() => handleDelete(med.id, med.name)}
                  style={styles.deleteBtn}
                  hitSlop={8}
                >
                  <TextWrapper style={styles.deleteBtnText}>×</TextWrapper>
                </Pressable>
              </View>
            </View>

            <View style={styles.timesRow}>
              {med.times.map(t => (
                <View key={t} style={[styles.timeTag, !med.enabled && styles.timeTagDisabled]}>
                  <TextWrapper style={styles.timeTagText}>{t}</TextWrapper>
                </View>
              ))}
            </View>
            {med.days && med.days.length < 7 && (
              <View style={styles.timesRow}>
                {WEEKDAY_LABELS.filter(w => med.days.includes(w.value)).map(({ value, short }) => (
                  <View key={value} style={[styles.dayTag, !med.enabled && styles.timeTagDisabled]}>
                    <TextWrapper style={styles.dayTagText}>{short}</TextWrapper>
                  </View>
                ))}
              </View>
            )}
            {isOverdue(med, takenToday) && (
              <Pressable
                style={styles.takenBtn}
                onPress={() => confirmTaken(med.id)}
              >
                <TextWrapper style={styles.takenBtnText}>✓ Приняла</TextWrapper>
              </Pressable>
            )}
          </Card>
        ))}
      </Screen>

      <Modal
        visible={popupVisible}
        animationType="slide"
        transparent
        onRequestClose={() => { setPopupVisible(false); resetForm(); }}
      >
        <SafeAreaView style={styles.overlay}>
          <View style={styles.modal}>
            <TextWrapper variant="title" style={styles.modalTitle}>
              Новое лекарство
            </TextWrapper>

            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Название"
              placeholderTextColor="#666"
              maxLength={60}
            />
            <TextInput
              style={styles.input}
              value={dosage}
              onChangeText={setDosage}
              placeholder="Дозировка (необязательно)"
              placeholderTextColor="#666"
              maxLength={40}
            />

            <TextWrapper style={styles.label}>Дни приёма</TextWrapper>
            <View style={styles.daysRow}>
              {WEEKDAY_LABELS.map(({ value, short }) => {
                const active = days.includes(value);
                return (
                  <Pressable
                    key={value}
                    onPress={() => toggleDay(value)}
                    style={[styles.dayChip, active && styles.dayChipActive]}
                  >
                    <TextWrapper style={[styles.dayChipText, active && styles.dayChipTextActive]}>
                      {short}
                    </TextWrapper>
                  </Pressable>
                );
              })}
            </View>

            <TextWrapper style={styles.label}>Время приёма</TextWrapper>

            <Pressable onPress={() => setShowTimePicker(true)} style={styles.timeAddRow}>
              <TextWrapper style={styles.timeAddRowText}>+ Добавить время</TextWrapper>
            </Pressable>
            {showTimePicker && (
              <DateTimePicker
                value={new Date()}
                mode="time"
                is24Hour
                display="clock"
                onChange={onTimePicked}
              />
            )}

            <ScrollView style={styles.timeList}>
              {times.map(t => (
                <View key={t} style={styles.timeListItem}>
                  <TextWrapper>{t}</TextWrapper>
                  <Pressable onPress={() => handleRemoveTime(t)} hitSlop={8}>
                    <TextWrapper style={styles.removeTime}>×</TextWrapper>
                  </Pressable>
                </View>
              ))}
            </ScrollView>

            <View style={styles.modalButtons}>
              <Button
                variant="secondary"
                onPress={() => { setPopupVisible(false); resetForm(); }}
              >
                Отмена
              </Button>
              <Button variant="primary" onPress={handleSave}>
                Сохранить
              </Button>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  addButton: {
    marginBottom: 16,
  },
  empty: {
    color: '#666',
    marginTop: 32,
    textAlign: 'center',
  },
  card: {
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
    marginRight: 8,
  },
  dosage: {
    color: '#aaa',
    fontSize: 13,
    marginTop: 2,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deleteBtn: {
    padding: 4,
  },
  deleteBtnText: {
    fontSize: 22,
    color: colors.danger,
    lineHeight: 24,
  },
  timesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  timeTag: {
    backgroundColor: colors.secondary + '33',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  timeTagDisabled: {
    opacity: 0.4,
  },
  timeTagText: {
    fontSize: 13,
    color: colors.text,
  },

  // Modal
  overlay: {
    flex: 1,
    backgroundColor: '#000000aa',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderColor: colors.secondary + '44',
  },
  modalTitle: {
    marginBottom: 16,
  },
  label: {
    color: '#aaa',
    fontSize: 13,
    marginBottom: 6,
    marginTop: 4,
  },
  input: {
    backgroundColor: '#ffffff0f',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: colors.text,
    marginBottom: 10,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#ffffff11',
  },
  timeAddRow: {
    backgroundColor: colors.secondary + '22',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.secondary,
    paddingVertical: 12,
    alignItems: 'center',
  },
  timeAddRowText: {
    fontSize: 15,
    color: colors.text,
  },
  timeList: {
    maxHeight: 140,
    marginTop: 8,
    marginBottom: 4,
  },
  timeListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderColor: '#ffffff11',
  },
  removeTime: {
    fontSize: 20,
    color: colors.danger,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 16,
  },
  daysRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 14,
    flexWrap: 'wrap',
  },
  dayChip: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#ffffff22',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayChipActive: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  dayChipText: {
    fontSize: 12,
    color: '#888',
  },
  dayChipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  dayTag: {
    backgroundColor: colors.primary + '22',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: colors.primary + '66',
  },
  dayTagText: {
    fontSize: 11,
    color: colors.primary,
  },
  takenBtn: {
    marginTop: 12,
    alignSelf: 'flex-start',
    backgroundColor: colors.secondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  takenBtnText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
});
