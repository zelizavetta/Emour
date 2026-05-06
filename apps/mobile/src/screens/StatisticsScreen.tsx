import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Switch, ScrollView, ActivityIndicator } from 'react-native';
import { Calendar, CalendarList, Agenda, LocaleConfig } from 'react-native-calendars';
import { List, Checkbox } from 'react-native-paper';

import { PopupWindow } from '@/components/ui/popupWindow';
import Screen from '@/components/ui/screen';
import TextWrapper from '@/components/ui/textWrapper';
import { useUserRecords } from '@/providers/UserContext';
import { Feeling, Symptom, DayPart } from '@emour/core';
import { dayPartMap, dropDownData, feelingItems, symptomItems } from '@/constants/data';
import { formatDateTime, nowLocalTime } from '@/utils/time';
import { colors } from '@/constants/colors';
import Card from '@/components/ui/card/card';


export default function StatisticScreen() {
    const [selected, setSelected] = useState('');
    const [value, setValue] = useState('');
    const [isFocus, setIsFocus] = useState(false);
    const [expandedFeeling, setExpandedFeeling] = React.useState(false);
    const [expandedSymptoms, setExpandedSymptoms] = React.useState(false);
    const [expandedTriggers, setExpandedTriggers] = React.useState(false);
    const [checked, setChecked] = React.useState<Record<string, boolean>>({});
    const [openDayPopup, setOpenDayPopup] = useState<boolean>(false)
    const [pressedDay, setPressedDay] = useState<string>('')
    const [moodRecords, setMoodRecords] = useState([])
    const [energyRecords, setEnergyRecords] = useState([])
    const [anxietyRecords, setAnxietyRecords] = useState([])
    const [data, setData] = useState<StatisticDataItem[]>([])
    const [dataFeelings, setDataFeelings] = useState<StatisticDataItem[]>([])
    const [dataSymptoms, setDataSymptoms] = useState<StatisticDataItem[]>([])
    const { feelings, symptoms, addFeelingRecord, isLoading, refresh } = useUserRecords()

    type StatisticFeelingItem = {
        value: string;
        dayPart: DayPart;
        score: number;
    };

    type StatisticSymptomItem = {
        value: string;
        dayPart: DayPart;
    };

    type StatisticDataItem = {
        date: string;
        feelings: StatisticFeelingItem[];
        symptoms: StatisticSymptomItem[];
    };

    function transform(data: Array<Feeling | Symptom>) : StatisticDataItem[]{
        const map = data.reduce<Record<string, Omit<StatisticDataItem, "date">>>((acc, record) => {
            const day = formatDateTime(record.createdAtClient, record.clientTimezone).slice(0, 10)
            if (!acc[day]) {
                acc[day] = {
                    feelings: [],
                    symptoms: [],
                };
            }
            console.log('acc[day]', acc[day])
            switch (record.type) {
                case 'feeling': {
                    const matchedFeelings = feelingItems.filter(item => item.expression(record.score) && item.value.split("-")[0] === record.feelingType)
                    if (matchedFeelings.length !== 0 && acc[day].feelings.findIndex(feeling => feeling.value === matchedFeelings[0].value) === -1) {
                        acc[day].feelings.push({value: matchedFeelings[0].value, dayPart: record.dayPart, score: record.score})
                    }
                    break
                }
                case 'symptom': {
                    const matchedSymptom = symptomItems.filter(item => item.value === record.symptomType)
                    if (matchedSymptom.length !== 0 && acc[day].symptoms.findIndex(symptom => symptom.value === matchedSymptom[0].value) === -1) {
                        acc[day].symptoms.push({value: matchedSymptom[0].value, dayPart: record.dayPart})
                    }
                    break
                }
            }
            return acc;
        }, {});

        return Object.entries(map).map(([date, value]) => ({
            date,
            feelings: value.feelings,
            symptoms: value.symptoms
        }));
    }

    useEffect(() => {
        const records = [...feelings, ...symptoms]
        const dataItems = transform(records)
        setData(dataItems)
    }, [feelings, symptoms]);

    // const data = [
    //     { date: '2026-03-24', value: ['1', '2', '5'] },
    //     { date: '2026-03-25', value: ['1', '2', '7'] },
    //     { date: '2026-03-26', value: [] },
    //     { date: '2026-03-27', value: ['8'] },
    // ]

    const activeValues = Object.keys(checked).filter(k => checked[k]);
    // const data = [...dataFeelings, ...dataSymptoms]
    const filteredData = activeValues.length ? data.filter(item =>
        activeValues.every(val => [...item.feelings.map(v => v.value), ...item.symptoms.map(v => v.value)].includes(val))
    ) : [];

    type MarkedDates = Record<
        string,
        {
            selected?: boolean;
            marked?: boolean;
            selectedColor?: string;
        }
    >;

    const markedDates = filteredData.reduce<MarkedDates>((acc, item) => {
        acc[item.date] = {
            selected: true,
            // selectedColor: 'blue',
        };
        return acc;
    }, {});

    const renderLabel = () => {
      if (value || isFocus) {
        return (
          <Text style={[styles.label, isFocus && { color: 'blue' }]}>
            Dropdown label
          </Text>
        );
      }
      return null;
    };

    const toggle = (key: string) => {
        setChecked((prev) => ({
        ...prev,
        [key]: !prev[key],
        }));
    };

    console.log('data:', data)
    console.log('checked', checked)

    console.log('activeValues: ', activeValues)
    console.log('filteredData: ', filteredData)

    console.log('markedDates: ', markedDates)

    return(
        <Screen onRefresh={refresh}>
            {/* {renderLabel()} */}
            <TextWrapper variant='bigTitle'>
                Статистика
            </TextWrapper>
            <Card>
                <List.AccordionGroup>
                    {dropDownData.map((dropData) => (
                        <List.Accordion
                            title={dropData.label} 
                            id={dropData.value} 
                            key={dropData.value} 
                            titleStyle={{ color: "white" }}
                            style={{ backgroundColor: "transparent", margin: 0, paddingVertical: 0  }}
                            contentStyle={{ paddingVertical: 0, paddingHorizontal: 0 }}
                            theme={{
                                colors: {
                                    background: "transparent",
                                    surface: "transparent", 
                                }
                            }}
                        >
                            <View style={{ maxHeight: 200 }}>
                                <ScrollView nestedScrollEnabled={true}>
                                    {dropData.data.map((item) => (
                                        <List.Item
                                            titleStyle={{ color: colors.text, fontSize: 14 }}
                                            style={{ backgroundColor: "transparent", margin: 0, paddingVertical: 0  }}
                                            key={item.value}
                                            title={item.label}
                                            onPress={() => toggle(item.value)}
                                            left={() => (
                                            <Checkbox
                                                status={checked[item.value] ? "checked" : "unchecked"}
                                                color={colors.active}
                                            />
                                            )}
                                        />
                                    ))}
                                </ScrollView>
                            </View>
                        </List.Accordion>
                    ))}
                    {/* <List.Accordion
                        title="Симптомы"
                        expanded={expandedSymptoms}
                        onPress={() => setExpandedSymptoms((prev) => !prev)}
                    >
                        <List.Item title="Галлюцинации">
                        </List.Item>
                        <List.Item title="Тремор" />
                        <List.Item title="Спутанность мыслей" />
                        <List.Item title="Апатия" />
                        <List.Item title="Странные мысли" />
                    </List.Accordion>
                    <List.Accordion
                        title="Триггеры"
                        expanded={expandedTriggers}
                        onPress={() => setExpandedTriggers((prev) => !prev)}
                    >
                        <List.Item title="Недостаток сна" />
                        <List.Item title="Социальная изоляция" />
                        <List.Item title="Долгое нахождение дома" />
                        <List.Item title="Стресс" />
                    </List.Accordion> */}
                </List.AccordionGroup>
                <View style={{ width: "100%", height: 1, borderWidth: 1, borderColor: colors.secondary, marginVertical: 16 }}></View>
                {isLoading ? (
                    <ActivityIndicator color={colors.active} style={{ paddingVertical: 40 }} />
                ) : <Calendar
                    theme={{
                        todayTextColor: colors.active,
                        calendarBackground: "transparent",
                        selectedDayBackgroundColor: colors.active,
                        dayTextColor: colors.text,
                        monthTextColor: colors.text,
                        arrowColor: colors.secondary
                    }}
                    // Specify the current date
                    current={nowLocalTime().slice(0, 10)}
                    // Callback that gets called when the user selects a day
                    onDayPress={day => {
                        setPressedDay(day.dateString)
                        setOpenDayPopup(true)
                    }}
                    // Mark specific dates as marked
                    markedDates={markedDates}
                />}
            </Card>
            <PopupWindow visible={openDayPopup} onClose={() => {console.log('pressedDay: ', pressedDay); setOpenDayPopup(false)}}>
                <View style={{ width: "100%", marginRight: "auto" }}>
                    <TextWrapper variant='title'>
                        В этот день:
                    </TextWrapper>
                    {dayPartMap.map(dayMap => (
                        <View key={dayMap.value} style={{ width: "100%", alignItems: "flex-start", paddingTop: 10 }}>
                            <TextWrapper style={{ fontWeight: "bold" }}>
                                {`${dayMap.label}:`}
                            </TextWrapper>
                            <View style={{ width: "100%", alignItems: "flex-start", paddingLeft: 10 }}>
                                {data.find(item => item.date === pressedDay)?.feelings.map((feeling) => (feeling.dayPart === dayMap.value) && (
                                    <TextWrapper key={feeling.value}>
                                        {`${feelingItems.filter(i => i.value === feeling.value)[0].label}(${feeling.score}/5)`}
                                    </TextWrapper>
                                ))} 
                                {data.find(item => item.date === pressedDay)?.symptoms.map((symptom) => (symptom.dayPart === dayMap.value) && (
                                    <TextWrapper key={symptom.value}>
                                        {`${symptomItems.filter(i => i.value === symptom.value)[0].label}`}
                                    </TextWrapper>
                                ))}
                            </View>
                        </View>
                    ))}
                    {/* <View style={{ height: 1, width: "100%", borderColor: "black", borderWidth: 1 }}></View> */}
                    
                </View>
            </PopupWindow>
        </Screen>
        
    )
}

const styles = StyleSheet.create({
    container: {
      backgroundColor: 'white',
      padding: 16,
    },
    dropdown: {
      height: 50,
      borderColor: 'gray',
      borderWidth: 0.5,
      borderRadius: 8,
      paddingHorizontal: 8,
    },
    icon: {
      marginRight: 5,
    },
    label: {
      position: 'absolute',
      backgroundColor: 'white',
      left: 22,
      top: 8,
      zIndex: 999,
      paddingHorizontal: 8,
      fontSize: 14,
    },
    placeholderStyle: {
      fontSize: 16,
    },
    selectedTextStyle: {
      fontSize: 16,
    },
    iconStyle: {
      width: 20,
      height: 20,
    },
    inputSearchStyle: {
      height: 40,
      fontSize: 16,
    },
  });