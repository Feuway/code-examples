/**
 * Created by Smirnov.Denis on 28.02.2018.
 *
 * Класс заявка
 *
 * @flow
 */
/* eslint-disable no-multi-spaces */

import { convertDateToMs, convertDateToCommonFormat } from '@/utils/func/date';
import {
    REQUEST_PLACE,
    REQUEST_PROBLEM,
    REQUEST_STATUS,
    REQUEST_TYPE,
} from "@/utils/constants/requests";

type Code = number;

type DecodedValue = string;

type Contact = {
    id: number;
    fullName: string;
    position: string;
    phone: string | number;
    email: string;
}

type TOptions = {
    id: number;
    number: number;
    type: DecodedValue;
    comment: ?string;
    response: ?string;
    lastModified: string;
    lastModifiedInMs: number;
    status: DecodedValue;
    schedule: DecodedValue;
    contact: ?Contact;
    contractId: ?number;
    territoryId: ?number;
    letterName: ?string;
    floorName: ?string;
    isClosed: DecodedValue;
    // new request
    place?: DecodedValue,
    problem?: DecodedValue,
}

type TForm = {
    type: DecodedValue;
    comment: ?string;
    contact: ?Contact;
    contractId: ?number;
    territoryId: ?number;
    letterName: ?string;
    floorName: ?string;
};

interface IFieldsNewRequest {
    +place: DecodedValue,
    +problem: DecodedValue,
}

export class CommonRequest {
    id: number;
    number: number;
    type: DecodedValue;
    comment: ?string;
    response: ?string;
    lastModified: string;
    lastModifiedInMs: number;
    status: DecodedValue;
    schedule: DecodedValue;
    contact: ?Contact;
    contractId: ?number;
    territoryId: ?number;
    letterName: ?string;
    floorName: ?string;
    isClosed: DecodedValue;

    constructor(options: TOptions) {
        this.id = options.id;
        this.number = options.number;
        this.type = options.type;
        this.comment = options.comment;
        this.response = options.response;
        this.lastModified = options.lastModified;
        this.lastModifiedInMs = options.lastModifiedInMs;
        this.status = options.status;
        this.schedule = options.schedule;
        this.contact = options.contact;
        this.contractId = options.contractId;
        this.territoryId = options.territoryId;
        this.letterName = options.letterName;
        this.floorName = options.floorName;
        this.isClosed = options.isClosed;
    }

    /**
     * Карта декодирования полей заявки
     *
     * @return {Map}
     * @private
     */
    static get _mapDecoding(): Map<Code, DecodedValue> {
        return new Map([
            // status
            [552,  REQUEST_STATUS.NEW],
            [555,  REQUEST_STATUS.REJECTED],
            [553,  REQUEST_STATUS.IN_WORK],
            [1081, REQUEST_STATUS.PAUSED],
            [554,  REQUEST_STATUS.COMPLETED],
            // schedule
            [546, 'В рабочее время 9:00-18:00'],
            [547, 'Круглосуточно'],
            [548, 'Первая половина дня 9:00-13:00'],
            [549, 'Вторая половина дня 14:00-18:00'],
            // isClosed
            [550, 'Да'],
            [551, 'Нет'],
            // type
            [1016, REQUEST_TYPE.HARD_COPY],
            [1432, REQUEST_TYPE.ORDER_SERVICE],
            [1444, REQUEST_TYPE.WATER_DELIVERY],
            [767,  REQUEST_TYPE.TERMINATION_CONTRACT],
            [545,  REQUEST_TYPE.OTHER],
            [984,  REQUEST_TYPE.MATERIAL_THINGS],
            [563,  REQUEST_TYPE.VIDEO_SURVEILLANCE], // 1435
        ]);
    }

    /**
     * Декодирование по карте
     *
     * @param id
     * @return {DecodedValue|string}
     */
    static decodeById(id: Code): DecodedValue {
        return CommonRequest._mapDecoding.get(id) || 'Данных нет';
    }

    /**
     * Кодирование значение по карте
     *
     * @param value
     * @return {number}
     */
    static codeByValue(value: DecodedValue): Code {
        let result: number = 0;
        const map = CommonRequest._mapDecoding.entries();
        for (const [key, val] of map) {
            if (value === val) result = key;
        }
        return result;
    }

    /**
     * Получение провереннго значения на декодированность,
     * если value - число, значит его надо декодировать
     * иначе оно уже декадировано
     *
     * @param value - значение
     * @param cb - декодирующая функция
     * @return {number}
     */
    static getCheckedDecodingValue(
        value: Code | DecodedValue,
        cb: (Code) => DecodedValue,
    ): DecodedValue {
        return typeof value === 'number' ? cb(value) : value;
    }

    /**
     * Создание объекта с параметрами для отправки на сервер
     *
     * @param dataForm
     * @return {{}}
     */
    static createParamsApi(dataForm: TForm | CommonRequest) {
        const { contact } = dataForm;
        return {
            net_type: CommonRequest.codeByValue(dataForm.type),
            comments: {
                TEXT: dataForm.comment,
                TYPE: 'TEXT',
            },
            contract_id: dataForm.contractId,
            bc_id: dataForm.territoryId,
            liter: dataForm.letterName,
            stage: dataForm.floorName,
            ...(contact && {
                contact_id: contact.id,
                email: contact.email,
                fio: contact.fullName,
                post: contact.position,
            }),
        };
    }

    /**
     * Создание нового экземпляра класса по параметрам, пришедшим с сервера
     *
     * @param params - данные с сервера
     * @return {CommonRequest}
     */
    static createOnParams(params: Object) {
        return new CommonRequest({
            id: Number(params.id),
            number: Number(params.sup_req_no),
            type: CommonRequest.getCheckedDecodingValue(
                params.net_type,
                CommonRequest.decodeById,
            ),
            comment: params.comments['TEXT'],
            response: params.comments_closed['TEXT'],
            lastModified: convertDateToCommonFormat(params.timestamp_x, 'DD.MM.YYYY kk:mm:ss'),
            lastModifiedInMs: convertDateToMs(params.timestamp_x, 'DD.MM.YYYY kk:mm:ss'),
            status: CommonRequest.getCheckedDecodingValue(
                params.state,
                CommonRequest.decodeById,
            ),
            schedule: CommonRequest.getCheckedDecodingValue(
                params.schedule,
                CommonRequest.decodeById,
            ),
            contact: {
                id: Number(params.contact_id),
                fullName: params.fio,
                position: params.post,
                phone: params.phone,
                email: params.email,
            },
            contractId: params.contract_id && Number(params.contract_id),
            territoryId: Number(params.bc_id),
            letterName: params.liter,
            floorName: params.floorName,
            isClosed: CommonRequest.getCheckedDecodingValue(
                params.is_closed,
                CommonRequest.decodeById,
            ),
        });
    }
}

/**
 * Заявка по эксплуатации
 *
 * place и problem - состовляют новый тип заявки
 */
export class MaintenanceRequest extends CommonRequest implements IFieldsNewRequest {
    place: string;
    problem: string;

    constructor(options: Object) {
        super(options);
        this.type = options.type;
        this.place = options.place;
        this.problem = options.problem;
    }

    /**
     * Карта декодирования типов новых
     * заявок по эксплуатации
     *
     * @return {Map}
     * @private
     */
    static get _mapDecodingTypeNewRequest(): Map<Code, DecodedValue> {
        return new Map([
            //-------
            // place
            [1477, 'Арендуемые помещения'],
            [1472, 'Территория'],
            [1473, 'Лифты и лифтовой холл'],
            [1474, 'Коридоры и технические помещения'],
            [1475, 'Санузлы'],
            [1476, 'Проходная'],
            [1478, 'Другое'],
            //---------
            // problem
            // Арендуемые помещения
            [1507, 'Освещение и электрика'],
            [1508, 'Уборка'],
            [1509, 'Температура и микроклимат'],
            [1510, 'Протечка'],
            [1511, 'Шум'],
            [1512, 'Ремонт'],
            [1513, 'Услуги связи'],
            // Территория
            [1489, 'Необходима уборка территории'],
            [1514, 'Мусорные контейнеры/урны переполнены'],
            [1490, 'Освещение'],
            [1491, 'Ремонт фасада'],
            // Лифты и лифтовой холл
            [1493, 'Не работает лифт'],
            [1494, 'Необходима уборка'],
            [1496, 'Неприятный запах'],
            // Коридоры и технические помещения
            [1498, 'Необходим ремонт'],
            // Санузлы
            [1499, 'Остутствует бумага/полотенцо/мыло'],
            [1500, 'Засор/поломока сантехники'],
            [1501, 'Отсутствие воды/протечка'],
            [1502, 'Ремонт/замена замка'],
            [1495, 'Замена лампочек'],
            // Проходная
            [1503, 'Не работают турникеты/шлагбаумы/двери'],
            [1504, 'Не срабатывает пропуск'],
            [1505, 'Замечание к работе администратора'],
            [1506, 'Замечание к работе сотрудника охраны'],
            [1497, 'Холодно/жарко'],
            // В каждой группе проблемы
            [1492, 'Другое'],
        ]);
    }

    /**
     * Карта декодирования
     * старых заявок в новые
     *
     * @return {Map}
     * @private
     */
    static get _mapDecodingLegacy(): Map<Code, [DecodedValue, DecodedValue]> {
        /* eslint-disable */
        return new Map([
            // net_type
            [545,  ['Арендуемые помещения', 'Другое']],
            [618,  ['Арендуемые помещения', 'Ремонт/другое']],
            [1001, ['Санузлы', 'Другое']],
            [1052, ['Арендуемые помещения', 'Услуги связи/другое']],
            [1053, ['Санузлы', 'Другое']],
            [1054, ['Территория', 'Другое']],
            [1055, ['Арендуемые помещения', 'Ремонт/другое']],
            [1002, ['Лифты и лифтовой холл', 'Не работает лифт']],
            [1056, ['Арендуемые помещения', 'Температура и микроклимат/другое']],
            [544,  ['Арендуемые помещения', 'Другое']],
            [612,  ['Арендуемые помещения', 'Освещение и электрика/замена лампочек']],
            [614,  ['Лестницы, коридоры, курилки', 'Другое']],
            [1000, ['Территория', 'Другое']],
            [1044, ['Арендуемые помещения', 'Ремонт/другое']],
            [540,  ['Территория', 'Другое']],
            [613,  ['Арендуемые помещения', 'Температура и микроклимат/другое']],
            [541,  ['Санузлы', 'Засор/поломка сантехники']],
            [542,  ['Арендуемые помещения', 'Температура и микроклимат/другое']],
            [611,  ['Арендуемые помещения', 'Освещение и электрика/замена лампочек']],
            [564,  ['Арендуемые помещения', 'Уборка/другое']],
            [999,  ['Лестницы, коридоры, курилки', 'Другое']],
            [1057, ['Арендуемые помещения', 'Другое']],
            [1058, ['Арендуемые помещения', 'Другое']],
            [1059, ['Арендуемые помещения', 'Другое']],
            [543,  ['Арендуемые помещения', 'Другое']],
            [559,  ['Арендуемые помещения', 'Услуги связи/не работает/плохо работает телефон']],
            [560,  ['Арендуемые помещения', 'Услуги связи/не работает/плохо работает телефон']],
            [557,  ['Проходная', 'Не работают турникеты/шлагбаумы']],
            [1428, ['Проходная', 'Другое']],
            [1430, ['Проходная', 'Не срабатывает пропуск']],
            [1431, ['Проходная', 'Другое']],
            [561,  ['Проходная', 'Не работают турникеты/шлагбаумы/двери']],
            [1427, ['Проходная', 'Не работают турникеты/шлагбаумы/двери']],
            [1436, ['Проходная', 'Другое']],
            [1437, ['Проходная', 'Не работают турникеты/шлагбаумы/двери']],
            [562,  ['Лестницы, коридоры, курилки', 'Другое']],
            [563,  ['Старые:проходная/другое', 'Новые: услуги/Контроль доступа/Видеонаблюдение/подключенная услуга']],
            [1432, ['Арендуемые помещения', 'Другое']],
            [1434, ['Лестницы, коридоры, курилки', 'Другое']],
            [1435, ['Проходная', 'Другое']],
            [590,  ['Помощь/Обратная связь', 'Другое']],
            [591,  ['Документы/Обратная связь', 'Другое']],
            [1016, ['Документы/Электронный документооборот/Печатные копии', 'Ранее заказано']],
            [1017, ['Документы/Обратная связь', 'Другое']],
            [1018, ['Документы/Заказ ЭЦП', 'Инфоблок (с датой заказа и статусом получения услуги, комментом)']],
            [592,  ['Проходная', 'Не срабатывает пропуск']],
            [984,  ['Новые заявки: услуги/Контроль доступа/Обратная связь/Пропуска на вывоз мат.ценностей', 'Старые можно не показывать - арендаторы съехали']],
            [1008, ['Услуги/аренда', 'Подключенная услуга']],
            [770,  ['Услуги/размещение рекламы', 'Подключенная услуга']],
            [1009, ['Помощь/связь с администрацией', 'Подключенная услуга']],
            [1444, ['Услуги/заказ бутилированной воды', 'Подключенная услуга']],
        ]);
    }

    /**
     * Декодирование по карте
     *
     * @return {DecodedValue|string}
     */
    static decodeByIdLegacy(id: Code): [DecodedValue, DecodedValue] {
        return MaintenanceRequest._mapDecodingLegacy.get(id) || ['Данных нет', 'Данных нет'];
    }

    /**
     * Декодирование типа новой заявки по карте
     *
     * @return {DecodedValue|string}
     */
    static decodeByIdNewRequest(id: Code): DecodedValue {
        return MaintenanceRequest._mapDecodingTypeNewRequest.get(id) || 'Данных нет';
    }

    /**
     * Кодирование типа новой заявки по карте
     *
     * @return {number}
     */
    static codeByValueNewRequest(value: DecodedValue): Code {
        let result: number = 0;
        const map = MaintenanceRequest._mapDecodingTypeNewRequest.entries();
        for (const [key, val] of map) {
            if (value === val) result = key;
        }
        return result;
    }

    /**
     * Карта декодирования типов старых
     * заявок по эксплуатации
     *
     * @return {Map}
     * @private
     */
    static get _mapDecodingTypeLegacyRequest(): Map<Code, DecodedValue> {
        return new Map([
            // type
            [1000, 'Внутренняя, прилегающая терр.'],
            [611,  'Электроснабжение'],
            [614,  'Интерьер'],
            [1002, 'Лифтовое оборудование'],
            [613,  'Вентиляция и кондиционирование'],
            [545,  'Прочее'],
            [541,  'Водоснабжение и канализация'],
            [1001, 'Оборудование санузлов'],
            [564,  'Клининговые услуги'],
            [561,  'Контроль доступа'],
            [592,  'Пропуска'],
            [1009, 'Жалобы на сотрудников УК'],
            [542,  'Теплоснабжение'],
            [559,  'Телефония'],
            [560,  'Интернет'],
            [543,  'Связь'],
        ]);
    }

    /**
     * Декодирование типа старой заявки по карте
     *
     * @param id
     * @return {DecodedValue|string}
     */
    static decodeByIdLegacyRequest(id: Code): DecodedValue {
        return MaintenanceRequest._mapDecodingTypeLegacyRequest.get(id) || 'Данных нет';
    }

    /**
     * Кодирование типа старой заявки по карте
     *
     * @param value
     * @return {number}
     */
    static codeByValueLegacyRequest(value: DecodedValue): Code {
        let result: number = 0;
        const map = MaintenanceRequest._mapDecodingTypeLegacyRequest.entries();
        for (const [key, val] of map) {
            if (value === val) result = key;
        }
        return result;
    }

    /**
     * Создание объекта с параметрами для отправки на сервер
     *
     * @param dataForm
     * @return {{}}
     */
    static createParamsApi(dataForm: Object) {
        return {
            ...super.createParamsApi(dataForm),
            net_type: MaintenanceRequest.codeByValueLegacyRequest(dataForm.legacyType),
            place: MaintenanceRequest.codeByValueNewRequest(dataForm.place),
            problem: MaintenanceRequest.codeByValueNewRequest(dataForm.problem),
        };
    }

    /**
     * Создание нового экземпляра класса по параметрам, пришедшим с сервера
     *
     * @param params - данные с сервера
     * @return {MaintenanceRequest}
     */
    static createOnParams(params: Object): MaintenanceRequest {
        let type = '';
        let place = '';
        let problem = '';

        // если поля для нового типа заявок присутствуют
        if (params.place && params.problem) {
            // то раскодируем эти новые поля по новой карте
            place = MaintenanceRequest.decodeByIdNewRequest(params.place);
            problem = MaintenanceRequest.decodeByIdNewRequest(params.problem);
        } else {
            // иначе раскодируем по старой
            const [placeLegacy, problemLegacy] = MaintenanceRequest.decodeByIdLegacy(params.net_type);
            place = placeLegacy;
            problem = problemLegacy;
        }
        type = MaintenanceRequest.decodeByIdLegacyRequest(params.net_type);

        return new MaintenanceRequest({
            ...super.createOnParams(params),
            type,
            place,
            problem,
        });
    }
}

/**
 * Заявка на изготовление печатную кпоию
 */
export class HardCopyRequest extends CommonRequest {
    payable: boolean;
    paymentNumber: string;

    constructor(options: Object) {
        super(options);
        this.payable = options.payable;
        this.paymentNumber = options.paymentNumber;
    }

    /**
     * Создание объекта с параметрами для отправки на сервер
     * по свойствам экземпляра
     *
     * @return {{}}
     */
    createParamsApiOnProp() {
        return CommonRequest.createParamsApi(this);
    }

    /**
     * Создание объекта с параметрами для отправки на сервер
     * по данным из формы
     *
     * @param dataForm
     * @return {{}}
     */
    static createParamsApi(dataForm: TForm) {
        return {
            ...super.createParamsApi(dataForm),
            contract_id: dataForm.contractId,
        };
    }

    /**
     * Создание нового экземпляра класса по параметрам, пришедшим с сервера
     *
     * @param params - данные с сервера
     * @return {HardCopyRequest}
     */
    static createOnParams(params: Object): HardCopyRequest {
        return new HardCopyRequest({
            ...super.createOnParams(params),
            // если УК - Чайка,
            // то ограничиваем возможность оплаты таких печатных копий
            payable: !params.yk_chtp,
            paymentNumber: params.contract_no,
        });
    }
}

/**
 * Заявка на подключение доставки воды
 */
export class DeliveryWaterRequest extends CommonRequest {
    constructor(options: TOptions) {
        super(options);
    }

    /**
     * Создание объекта с параметрами для отправки на сервер
     * по данным из формы
     *
     * @param dataForm
     * @return {{}}
     */
    static createParamsApi(dataForm: Object) {
        return {
            ...super.createParamsApi(dataForm),
            pass_id: dataForm.passesId,
        };
    }

    /**
     * Создание нового экземпляра класса по параметрам, пришедшим с сервера
     *
     * @param params - данные с сервера
     * @return {DeliveryWaterRequest}
     */
    static createOnParams(params: Object): DeliveryWaterRequest {
        return new DeliveryWaterRequest({
            ...super.createOnParams(params),
        });
    }
}

/**
 * Заявка по связи с администрацией в разделе помощь
 */
export class HelpRequest extends CommonRequest implements IFieldsNewRequest {
    place: string;
    problem: string;

    constructor(options: TOptions) {
        super(options);
        this.place = options.place || '';
        this.problem = options.problem || '';
    }

    /**
     * Карта декодирования типов новых
     * заявок по эксплуатации
     *
     * @return {Map}
     * @private
     */
    static get _mapDecodingTypeNewRequest(): Map<Code, DecodedValue> {
        return new Map([
            //-------
            // place
            [1527, REQUEST_PLACE.CONNECTION_TO_ADMINS],
            //---------
            // problem
            [1528, REQUEST_PROBLEM.REQUEST],
            [1529, REQUEST_PROBLEM.COMPLAINT],
            [1530, REQUEST_PROBLEM.OFFER],
            [1531, REQUEST_PROBLEM.REVIEW],
        ]);
    }

    /**
     * Декодирование типа новой заявки по карте
     *
     * @param id
     * @return {DecodedValue|string}
     */
    static decodeByIdNewRequest(id: Code): DecodedValue {
        return HelpRequest._mapDecodingTypeNewRequest.get(id) || 'Данных нет';
    }

    /**
     * Кодирование типа новой заявки по карте
     *
     * @param value
     * @return {number}
     */
    static codeByValueNewRequest(value: DecodedValue): Code {
        let result: number = 0;
        const map = HelpRequest._mapDecodingTypeNewRequest.entries();
        for (const [key, val] of map) {
            if (value === val) result = key;
        }
        return result;
    }

    /**
     * Создание объекта с параметрами для отправки на сервер
     * по данным из формы
     *
     * @param dataForm
     * @return {{}}
     */
    static createParamsApi(dataForm: Object) {
        return {
            ...CommonRequest.createParamsApi(dataForm),
            place: HelpRequest.codeByValueNewRequest(REQUEST_PLACE.CONNECTION_TO_ADMINS),
            problem: HelpRequest.codeByValueNewRequest(dataForm.problem),
        };
    }

    /**
     * Создание нового экземпляра класса по параметрам, пришедшим с сервера
     *
     * @param params - данные с сервера
     * @return {HelpRequest}
     */
    static createOnParams(params: Object): HelpRequest {
        return new HelpRequest({
            ...super.createOnParams(params),
            place: HelpRequest.decodeByIdNewRequest(params.place),
            problem: HelpRequest.decodeByIdNewRequest(params.problem),
        });
    }
}


