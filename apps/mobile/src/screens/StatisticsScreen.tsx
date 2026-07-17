import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Calendar } from 'react-native-calendars';
import { List, Checkbox } from 'react-native-paper';
import { LineChart } from 'react-native-gifted-charts';

import Screen from '@/components/ui/screen';
import TextWrapper from '@/components/ui/textWrapper';
import Button from '@/components/ui/button';
import Card from '@/components/ui/card/card';
import { useUserRecords } from '@/providers/UserContext';
import { useAuth } from '@/providers/AuthProvider';
import { Feeling, Symptom, DayPart, FeelingType } from '@emour/core';
import { dropDownData, feelingItems, symptomItems } from '@/constants/data';
import { formatDateTime, nowLocalTime } from '@/utils/time';
import { colors } from '@/constants/colors';

type StatisticFeelingItem = { value: string; dayPart: DayPart; score: number };
type StatisticSymptomItem = { value: string; dayPart: DayPart };
type StatisticDataItem = {
  date: string;
  feelings: StatisticFeelingItem[];
  symptoms: StatisticSymptomItem[];
};

type MarkedDates = Record<string, { selected?: boolean; marked?: boolean; selectedColor?: string; dotColor?: string }>;

function transform(data: Array<Feeling | Symptom>): StatisticDataItem[] {
  const map = data.reduce<Record<string, Omit<StatisticDataItem, 'date'>>>((acc, record) => {
    const day = formatDateTime(record.createdAtClient, record.clientTimezone).slice(0, 10);
    if (!acc[day]) acc[day] = { feelings: [], symptoms: [] };
    if (record.type === 'feeling') {
      const matched = feelingItems.filter(
        i => i.expression(record.score) && i.value.split('-')[0] === record.feelingType,
      );
      if (matched.length && !acc[day].feelings.find(f => f.value === matched[0].value)) {
        acc[day].feelings.push({ value: matched[0].value, dayPart: record.dayPart, score: record.score });
      }
    } else if (record.type === 'symptom') {
      const matched = symptomItems.filter(i => i.value === record.symptomType);
      if (matched.length && !acc[day].symptoms.find(s => s.value === matched[0].value)) {
        acc[day].symptoms.push({ value: matched[0].value, dayPart: record.dayPart });
      }
    }
    return acc;
  }, {});
  return Object.entries(map).map(([date, v]) => ({ date, ...v }));
}

const FEELING_CONFIG: { type: FeelingType; label: string; color: string }[] = [
  { type: 'mood', label: 'Настроение', color: colors.primary },
  { type: 'energy', label: 'Энергия', color: colors.secondary },
  { type: 'anxiety', label: 'Тревога', color: '#fbee00' },
];

const RANGES: { value: number; label: string }[] = [
  { value: 7, label: '7 дней' },
  { value: 30, label: '30 дней' },
  { value: 90, label: '3 месяца' },
];

type ChartPoint = {
  value: number;
  label: string;
  dataPointText: string;
  hideDataPoint?: boolean;
};

function buildDateGrid(rangeDays: number): string[] {
  const today = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return Array.from({ length: rangeDays }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (rangeDays - 1 - i));
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  });
}

function buildSeries(
  feelings: Feeling[],
  type: FeelingType,
  grid: string[],
  labelStep: number,
): ChartPoint[] {
  const byDate: Record<string, number[]> = {};
  for (const f of feelings) {
    if (f.feelingType !== type) continue;
    const date = formatDateTime(f.createdAtClient, f.clientTimezone).slice(0, 10);
    if (!byDate[date]) byDate[date] = [];
    byDate[date].push(f.score);
  }

  const entries = Object.entries(byDate)
    .filter(([date]) => grid.includes(date))
    .sort(([a], [b]) => a.localeCompare(b));

  if (entries.length === 0) return [];

  const fewPoints = entries.length <= 7;

  return entries.map(([date, scores], i) => {
    const gridIdx = grid.indexOf(date);
    const isFirst = i === 0;
    const isLast = i === entries.length - 1;
    const showLabel = fewPoints
      ? true
      : isFirst || isLast || gridIdx % labelStep === 0;
    const d = new Date(date + 'T12:00:00');
    const label = showLabel
      ? `${d.getDate()}.${String(d.getMonth() + 1).padStart(2, '0')}`
      : '';
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    return { value: Math.round(avg * 10) / 10, label, dataPointText: String(Math.round(avg)) };
  });
}

export default function StatisticScreen() {
  const { feelings, symptoms, addFeelingRecord, addSymptomsRecord, isLoading, refresh } = useUserRecords();
  const { isViewer } = useAuth();
  const { width: screenWidth } = useWindowDimensions();

  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [data, setData] = useState<StatisticDataItem[]>([]);

  const [openDayPopup, setOpenDayPopup] = useState(false);
  const [pressedDay, setPressedDay] = useState('');
  const [tab, setTab] = useState<'view' | 'add'>('view');

  // chart state
  const [chartCriteria, setChartCriteria] = useState<FeelingType[]>(['mood']);
  const [chartRange, setChartRange] = useState(30);

  // add form state
  const [moodScore, setMoodScore] = useState(3);
  const [energyScore, setEnergyScore] = useState(3);
  const [anxietyScore, setAnxietyScore] = useState(3);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    setData(transform([...feelings, ...symptoms]));
  }, [feelings, symptoms]);

  const chartLabelStep = chartRange <= 7 ? 1 : chartRange <= 30 ? 5 : 10;

  const chartGrid = useMemo(() => buildDateGrid(chartRange), [chartRange]);

  const chartSeries = useMemo(() => {
    return FEELING_CONFIG
      .filter(c => chartCriteria.includes(c.type))
      .map(c => ({ ...c, data: buildSeries(feelings, c.type, chartGrid, chartLabelStep) }))
      .filter(c => c.data.length > 0);
  }, [feelings, chartCriteria, chartGrid, chartLabelStep]);

  const hasChartData = chartSeries.length > 0;
  const [chartContainerWidth, setChartContainerWidth] = useState(0);
  const YAXIS_WIDTH = 35;
  const CARD_PADDING = 40; // 20px left + 20px right
  const chartWidth = (chartContainerWidth > 0 ? chartContainerWidth : screenWidth - 88) - CARD_PADDING - YAXIS_WIDTH;

  const toggle = (key: string) => setChecked(prev => ({ ...prev, [key]: !prev[key] }));
  const toggleSymptom = (v: string) =>
    setSelectedSymptoms(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]);

  const activeValues = Object.keys(checked).filter(k => checked[k]);
  const filteredData = activeValues.length
    ? data.filter(item =>
        activeValues.every(val =>
          [...item.feelings.map(f => f.value), ...item.symptoms.map(s => s.value)].includes(val),
        ),
      )
    : [];

  // Dot on every date that has at least one raw record (feelings or symptoms)
  const allRecordDates = useMemo(() => {
    const dates = new Set<string>();
    for (const f of feelings) {
      dates.add(formatDateTime(f.createdAtClient, f.clientTimezone).slice(0, 10));
    }
    for (const s of symptoms) {
      dates.add(formatDateTime(s.createdAtClient, s.clientTimezone).slice(0, 10));
    }
    return dates;
  }, [feelings, symptoms]);

  const markedDates = useMemo<MarkedDates>(() => {
    const result: MarkedDates = {};
    for (const date of allRecordDates) {
      result[date] = { marked: true, dotColor: colors.secondary };
    }
    if (activeValues.length > 0) {
      for (const item of filteredData) {
        result[item.date] = {
          ...result[item.date],
          selected: true,
          selectedColor: colors.active,
        };
      }
    }
    return result;
  }, [allRecordDates, filteredData, activeValues]);

  function openDay(dateString: string) {
    setPressedDay(dateString);
    setTab('view');
    setMoodScore(3);
    setEnergyScore(3);
    setAnxietyScore(3);
    setSelectedSymptoms([]);
    setOpenDayPopup(true);
  }

  // noon of selected day in local timezone → ISO UTC
  function dayTimestamp() {
    return new Date(`${pressedDay}T12:00:00`).toISOString();
  }

  async function saveFeelings() {
    setSaving('feelings');
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const ts = dayTimestamp();
    await Promise.all([
      addFeelingRecord('mood', moodScore, ts, tz),
      addFeelingRecord('energy', energyScore, ts, tz),
      addFeelingRecord('anxiety', anxietyScore, ts, tz),
    ]);
    setSaving(null);
    setTab('view');
  }

  async function saveSymptoms() {
    if (selectedSymptoms.length === 0) return;
    setSaving('symptoms');
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    await addSymptomsRecord(selectedSymptoms, dayTimestamp(), tz);
    setSelectedSymptoms([]);
    setSaving(null);
  }

  // Raw records for the pressed day — bypasses transform's expression filtering
  const dayFeelingsByType = useMemo(() => {
    if (!pressedDay) return [];
    const grouped: Partial<Record<FeelingType, number[]>> = {};
    for (const f of feelings) {
      if (formatDateTime(f.createdAtClient, f.clientTimezone).slice(0, 10) !== pressedDay) continue;
      if (!grouped[f.feelingType]) grouped[f.feelingType] = [];
      grouped[f.feelingType]!.push(f.score);
    }
    return FEELING_CONFIG
      .map(({ type, label, color }) => {
        const scores = grouped[type];
        if (!scores) return null;
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        return { type, label, color, score: Math.round(avg * 10) / 10 };
      })
      .filter((x): x is { type: FeelingType; label: string; color: string; score: number } => x !== null);
  }, [feelings, pressedDay]);

  const daySymptomTypes = useMemo(() => {
    if (!pressedDay) return [] as typeof symptoms;
    const seen = new Set<string>();
    return symptoms.filter(s => {
      if (formatDateTime(s.createdAtClient, s.clientTimezone).slice(0, 10) !== pressedDay) return false;
      if (seen.has(s.symptomType)) return false;
      seen.add(s.symptomType);
      return true;
    });
  }, [symptoms, pressedDay]);

  const formattedDay = pressedDay
    ? new Date(`${pressedDay}T12:00:00`).toLocaleDateString('ru', {
        day: 'numeric', month: 'long', weekday: 'long',
      })
    : '';

  return (
    <Screen onRefresh={refresh}>
      <TextWrapper variant="bigTitle">Статистика</TextWrapper>

      <Card>
        <List.AccordionGroup>
          {dropDownData.map(dropData => (
            <List.Accordion
              key={dropData.value}
              title={dropData.label}
              id={dropData.value}
              titleStyle={{ color: 'white' }}
              style={{ backgroundColor: 'transparent', margin: 0, paddingVertical: 0 }}
              contentStyle={{ paddingVertical: 0, paddingHorizontal: 0 }}
              theme={{ colors: { background: 'transparent', surface: 'transparent' } }}
            >
              <View style={{ maxHeight: 200 }}>
                <ScrollView nestedScrollEnabled>
                  {dropData.data.map(item => (
                    <List.Item
                      key={item.value}
                      title={item.label}
                      titleStyle={{ color: colors.text, fontSize: 14 }}
                      style={{ backgroundColor: 'transparent', margin: 0, paddingVertical: 0 }}
                      onPress={() => toggle(item.value)}
                      left={() => (
                        <Checkbox
                          status={checked[item.value] ? 'checked' : 'unchecked'}
                          color={colors.active}
                        />
                      )}
                    />
                  ))}
                </ScrollView>
              </View>
            </List.Accordion>
          ))}
        </List.AccordionGroup>

        <View style={styles.divider} />

        {isLoading ? (
          <ActivityIndicator color={colors.active} style={{ paddingVertical: 40 }} />
        ) : (
          <Calendar
            theme={{
              todayTextColor: colors.active,
              calendarBackground: 'transparent',
              selectedDayBackgroundColor: colors.active,
              dayTextColor: colors.text,
              monthTextColor: colors.text,
              arrowColor: colors.secondary,
            }}
            current={nowLocalTime().slice(0, 10)}
            onDayPress={day => openDay(day.dateString)}
            markedDates={markedDates}
          />
        )}
      </Card>

      {/* Chart */}
      <Card
        style={{ marginTop: 12 }}
        onLayout={e => setChartContainerWidth(e.nativeEvent.layout.width)}
      >
        <TextWrapper variant="title" style={{ marginBottom: 12 }}>График</TextWrapper>

        {/* Criterion selector — multiple */}
        <View style={styles.selectorRow}>
          {FEELING_CONFIG.map(({ type, label, color }) => {
            const active = chartCriteria.includes(type);
            return (
              <Pressable
                key={type}
                style={[styles.selectorChip, active && { backgroundColor: color, borderColor: color }]}
                onPress={() =>
                  setChartCriteria(prev =>
                    prev.includes(type)
                      ? prev.length > 1 ? prev.filter(t => t !== type) : prev
                      : [...prev, type],
                  )
                }
              >
                <TextWrapper style={[styles.selectorText, active && { color: '#fff' }]}>
                  {label}
                </TextWrapper>
              </Pressable>
            );
          })}
        </View>

        {/* Range selector */}
        <View style={[styles.selectorRow, { marginBottom: 12 }]}>
          {RANGES.map(({ value, label }) => (
            <Pressable
              key={value}
              style={[styles.selectorChip, chartRange === value && styles.selectorChipActive]}
              onPress={() => setChartRange(value)}
            >
              <TextWrapper style={[styles.selectorText, chartRange === value && styles.selectorTextActive]}>
                {label}
              </TextWrapper>
            </Pressable>
          ))}
        </View>

        {/* Legend */}
        {hasChartData && (
          <View style={styles.legend}>
            {chartSeries.map(({ type, label, color }) => (
              <View key={type} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: color }]} />
                <TextWrapper style={styles.legendText}>{label}</TextWrapper>
              </View>
            ))}
          </View>
        )}

        {isLoading ? (
          <ActivityIndicator color={colors.active} style={{ paddingVertical: 32 }} />
        ) : !hasChartData ? (
          <TextWrapper style={[styles.empty, { paddingVertical: 32 }]}>
            Нет данных за выбранный период
          </TextWrapper>
        ) : (
          <LineChart
            data={chartSeries[0].data}
            {...(chartSeries[1] ? { data2: chartSeries[1].data } : {})}
            {...(chartSeries[2] ? { data3: chartSeries[2].data } : {})}
            color1={chartSeries[0].color}
            {...(chartSeries[1] ? { color2: chartSeries[1].color } : {})}
            {...(chartSeries[2] ? { color3: chartSeries[2].color } : {})}
            dataPointsColor1={chartSeries[0].color}
            {...(chartSeries[1] ? { dataPointsColor2: chartSeries[1].color } : {})}
            {...(chartSeries[2] ? { dataPointsColor3: chartSeries[2].color } : {})}
            width={chartWidth}
            height={160}
            yAxisLabelWidth={YAXIS_WIDTH}
            areaChart={chartSeries.length === 1}
            startFillColor={chartSeries.length === 1 ? chartSeries[0].color : undefined}
            endFillColor={chartSeries.length === 1 ? 'transparent' : undefined}
            startOpacity={chartSeries.length === 1 ? 0.2 : undefined}
            endOpacity={0}
            noOfSections={4}
            maxValue={5}
            yAxisTextStyle={{ color: '#888', fontSize: 11 }}
            xAxisLabelTextStyle={{ color: '#888', fontSize: 10 }}
            xAxisColor="#333"
            yAxisColor="#333"
            rulesColor="#1a1a2a"
            curved
            thickness={2}
            scrollToEnd
            showDataPointLabelOnFocus
          />
        )}
      </Card>

      {/* Day detail modal */}
      <Modal
        visible={openDayPopup}
        animationType="slide"
        transparent
        onRequestClose={() => setOpenDayPopup(false)}
      >
        <View style={styles.modalContainer}>
          {/* Tap-to-close area above the sheet */}
          <Pressable style={{ flex: 1 }} onPress={() => setOpenDayPopup(false)} />
          <View style={styles.sheet}>
          <View style={styles.sheetHandle} />

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
            <TextWrapper variant="title" style={styles.sheetTitle}>
              {formattedDay}
            </TextWrapper>

            {/* Tabs */}
            {/* <View style={styles.tabs}>
              <Pressable
                style={[styles.tab, tab === 'view' && styles.tabActive]}
                onPress={() => setTab('view')}
              >
                <TextWrapper style={[styles.tabText, tab === 'view' && styles.tabTextActive]}>
                  Записи
                </TextWrapper>
              </Pressable>
              <Pressable
                style={[styles.tab, tab === 'add' && styles.tabActive]}
                onPress={() => setTab('add')}
              >
                <TextWrapper style={[styles.tabText, tab === 'add' && styles.tabTextActive]}>
                  Добавить
                </TextWrapper>
              </Pressable>
            </View> */}

            {tab === 'view' && (
              <View style={styles.section}>
                {dayFeelingsByType.length === 0 && daySymptomTypes.length === 0 ? (
                  <TextWrapper style={styles.empty}>Нет записей за этот день</TextWrapper>
                ) : (
                  <>
                    {dayFeelingsByType.length > 0 && (
                      <View style={styles.group}>
                        <TextWrapper style={styles.groupTitle}>Состояния</TextWrapper>
                        {dayFeelingsByType.map(({ type, label, color, score }) => (
                          <View key={type} style={styles.recordRow}>
                            <TextWrapper style={styles.recordLabel}>{label}</TextWrapper>
                            <TextWrapper style={[styles.recordScore, { color }]}>{score}/5</TextWrapper>
                          </View>
                        ))}
                      </View>
                    )}
                    {daySymptomTypes.length > 0 && (
                      <View style={styles.group}>
                        <TextWrapper style={styles.groupTitle}>Симптомы</TextWrapper>
                        <View style={styles.chips}>
                          {daySymptomTypes.map(s => {
                            const label = symptomItems.find(i => i.value === s.symptomType)?.label ?? s.symptomType;
                            return (
                              <View key={s.id} style={styles.chip}>
                                <TextWrapper style={styles.chipText}>{label}</TextWrapper>
                              </View>
                            );
                          })}
                        </View>
                      </View>
                    )}
                  </>
                )}
                {!isViewer && (
                  <Button
                    variant="secondary"
                    style={styles.addHintBtn}
                    onPress={() => setTab('add')}
                  >
                    Изменить запись
                  </Button>
                )}
              </View>
            )}

            {tab === 'add' && (
              <View style={styles.section}>
                {/* Feeling sliders */}
                <TextWrapper style={styles.groupTitle}>Состояния</TextWrapper>
                {FEELING_CONFIG.map(({ type, label, color }) => {
                  const score = type === 'mood' ? moodScore : type === 'energy' ? energyScore : anxietyScore;
                  const setScore = type === 'mood' ? setMoodScore : type === 'energy' ? setEnergyScore : setAnxietyScore;
                  return (
                    <View key={type} style={styles.sliderBlock}>
                      <View style={styles.sliderHeader}>
                        <TextWrapper style={styles.sliderLabel}>{label}</TextWrapper>
                        <TextWrapper style={[styles.sliderScore, { color }]}>{score}/5</TextWrapper>
                      </View>
                      <Slider
                        style={styles.slider}
                        minimumValue={1}
                        maximumValue={5}
                        step={1}
                        value={score}
                        onValueChange={setScore}
                        minimumTrackTintColor={color}
                        maximumTrackTintColor="#333"
                        thumbTintColor={color}
                      />
                    </View>
                  );
                })}
                <Button
                  variant="primary"
                  style={styles.saveBtn}
                  onPress={saveFeelings}
                  disabled={saving === 'feelings'}
                >
                  {saving === 'feelings' ? 'Сохраняем...' : 'Сохранить состояния'}
                </Button>

                <View style={styles.divider} />

                {/* Symptoms */}
                <TextWrapper style={styles.groupTitle}>Симптомы</TextWrapper>
                <View style={styles.chips}>
                  {symptomItems.map(item => {
                    const active = selectedSymptoms.includes(item.value);
                    return (
                      <Pressable
                        key={item.value}
                        style={[styles.chip, active && styles.chipActive]}
                        onPress={() => toggleSymptom(item.value)}
                      >
                        <TextWrapper style={[styles.chipText, active && styles.chipTextActive]}>
                          {item.label}
                        </TextWrapper>
                      </Pressable>
                    );
                  })}
                </View>
                <Button
                  variant="secondary"
                  style={styles.saveBtn}
                  onPress={saveSymptoms}
                  disabled={saving === 'symptoms' || selectedSymptoms.length === 0}
                >
                  {saving === 'symptoms' ? 'Сохраняем...' : `Сохранить симптомы (${selectedSymptoms.length})`}
                </Button>
              </View>
            )}
          </ScrollView>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  divider: {
    width: '100%',
    height: 1,
    borderWidth: 1,
    borderColor: colors.secondary,
    marginVertical: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000000aa',
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderColor: colors.secondary + '44',
    maxHeight: '85%',
    paddingHorizontal: 20,
    paddingTop: 0,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#555',
    alignSelf: 'center',
    marginVertical: 12,
  },
  sheetTitle: {
    marginBottom: 16,
    textTransform: 'capitalize',
  },
  tabs: {
    flexDirection: 'row',
    borderRadius: 10,
    backgroundColor: '#ffffff0f',
    marginBottom: 20,
    padding: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: colors.secondary,
  },
  tabText: {
    fontSize: 14,
    color: '#888',
  },
  tabTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  section: {
    paddingBottom: 8,
  },
  group: {
    marginBottom: 16,
  },
  groupTitle: {
    fontWeight: '600',
    fontSize: 14,
    color: colors.secondary,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  recordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderColor: '#ffffff11',
  },
  recordLabel: {
    fontSize: 14,
  },
  recordScore: {
    fontSize: 14,
    color: colors.secondary,
    fontWeight: '600',
  },
  empty: {
    color: '#666',
    textAlign: 'center',
    paddingVertical: 20,
  },
  addHintBtn: {
    marginTop: 16,
    alignSelf: 'center',
  },
  sliderBlock: {
    marginBottom: 12,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sliderLabel: {
    fontSize: 14,
  },
  sliderScore: {
    fontSize: 14,
    fontWeight: '700',
  },
  slider: {
    width: '100%',
    height: 32,
  },
  saveBtn: {
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ffffff22',
    backgroundColor: 'transparent',
  },
  chipActive: {
    backgroundColor: colors.secondary + '33',
    borderColor: colors.secondary,
  },
  chipText: {
    fontSize: 13,
    color: '#888',
  },
  chipTextActive: {
    color: colors.text,
  },
  selectorRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  selectorChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ffffff22',
  },
  selectorChipActive: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  selectorText: {
    fontSize: 13,
    color: '#888',
  },
  selectorTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  legend: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#aaa',
  },
});
