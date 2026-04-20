export const dayPartMap = [
    { value: 'evening', label: 'вечер'},
    { value: 'morning', label: 'утро'},
    { value: 'night', label: 'ночь'},
    { value: 'afternoon', label: 'день'},
]

// export const dropDownItems = [
//     { label: 'Состояния', value: 'feelings' },
//     { label: 'Симптомы', value: 'symptoms' },
//     // { label: 'Триггеры', value: 'triggers' },
//     // { label: 'Сон', value: 'sleep' },
// ];

export const feelingItems = [
    {value: 'mood-low', label: 'Плохое настроение', expression: (score: number) => score < 3}, 
    {value: 'energy-high', label: 'Высокая энергия', expression: (score: number) => score > 3}, 
    {value: 'anxiety-high', label: 'Высокая тревога', expression: (score: number) => score > 3}, 
    {value: 'mood-high', label: 'Хорошее настроение', expression: (score: number) => score > 3}, 
    {value: 'energy-low', label: "Низкая энергия", expression: (score: number) => score < 3},
    {value: 'anxiety-low', label: "Низкая тревога", expression: (score: number) => score < 3}, 
]

export const symptomItems = [
    {value: "tr", label: "Тремор"},
    {value: "think", label: "Спутанные мысли"},
    {value: "suic", label: "Суицидальные мысли"},
    {value: "apat", label: "Апатия"},
    {value: "ideas", label: "Странные идеи"},
    {value: "razdr", label: "Раздражительность"},
    {value: "neysid", label: "Неусидчивость"},
    {value: "gall", label: "Галлюцинации"},
    {value: "frag", label: "Фрагментарность"},
    {value: "nav-think", label: "Навязчивые мысли"},
]

export const dropDownData = [
    {value: 'feelings', label: "Состояния", data: feelingItems},
    {value: 'symptoms', label: "Симптомы", data: symptomItems},
]