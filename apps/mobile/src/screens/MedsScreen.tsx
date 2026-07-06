import React, { useState } from 'react';
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
import Button from '@/components/ui/button';
import Card from '@/components/ui/card/card';
import Screen from '@/components/ui/screen';
import TextWrapper from '@/components/ui/textWrapper';
import { colors } from '@/constants/colors';
import { Med } from '@emour/core';
import { useMeds } from '@/providers/MedsProvider';

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

export default function MedsScreen() {
  const { meds, addMed, removeMed, toggleMed, refresh } = useMeds();

  const [popupVisible, setPopupVisible] = useState(false);
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [times, setTimes] = useState<string[]>([]);
  const [timeInput, setTimeInput] = useState('');

  function resetForm() {
    setName('');
    setDosage('');
    setTimes([]);
    setTimeInput('');
  }

  function handleAddTime() {
    const trimmed = timeInput.trim();
    if (!TIME_RE.test(trimmed)) {
      Alert.alert('Неверный формат', 'Введите время в формате чч:мм (например 08:30)');
      return;
    }
    if (times.includes(trimmed)) {
      setTimeInput('');
      return;
    }
    setTimes(prev => [...prev, trimmed].sort());
    setTimeInput('');
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
    await addMed(name.trim(), dosage.trim(), times);
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

            <TextWrapper style={styles.label}>Время приёма</TextWrapper>

            <View style={styles.timeInputRow}>
              <TextInput
                style={[styles.input, styles.timeInputField]}
                value={timeInput}
                onChangeText={setTimeInput}
                placeholder="чч:мм"
                placeholderTextColor="#666"
                keyboardType="numbers-and-punctuation"
                maxLength={5}
                onSubmitEditing={handleAddTime}
              />
              <Pressable onPress={handleAddTime} style={styles.timeAddBtn}>
                <TextWrapper style={styles.timeAddBtnText}>+</TextWrapper>
              </Pressable>
            </View>

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
  timeInputRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  timeInputField: {
    flex: 1,
    marginBottom: 0,
  },
  timeAddBtn: {
    backgroundColor: colors.secondary,
    borderRadius: 10,
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeAddBtnText: {
    fontSize: 24,
    color: colors.text,
    lineHeight: 26,
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
});
