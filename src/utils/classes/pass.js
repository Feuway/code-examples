/**
 * Created by Smirnov.Denis on 28.12.2017.
 *
 * Класс пропуск
 *
 * @flow
 */

import moment from "moment";
import { convertDateToMs, convertDateToCommonFormat } from '@/utils/func/date';
import {
    PASS_REGIME_STAYING,
    PASS_STATUS,
    PASS_TYPE,
    PASS_TYPE_AUTO,
} from "@/utils/constants/passes";

import WorkingTime from "./working-time";

type ListWorkingTimes = WorkingTime[];

type IsActive = "Y" | "N";

type DateString = string;

type Code = number;

type DecodedValue = string;

type Personalization = "guest" | "named";

type ReorderPassModal = "person" | "car" | "truck" | "bike";

interface ITimeTracking {
  listWorkingTimes: ListWorkingTimes;
  +totalWorkingTimes: string;
  +hasWorkingTimes: boolean;
}

type TOptionsPass = {
    id: number,
    fullName: string,
    photo: string,
    isActive: IsActive,
    status: Code,
    type: Code,
    typeAuto: Code,
    numberAuto: string,
    dates: {
        ordered: DateString,
        issued: DateString,
        validUntil: DateString
    },
    lastModified: string;
    lastModifiedInMs: number;
    organization: string,
    regimeStaying: Code,
    listWorkingTimes: ListWorkingTimes,
    listTerritoriesId: number[],
    parkingId: number,
    ownerId: ?number,
    response: string,
    isUsed: boolean,
};

export default class Pass implements ITimeTracking {
    id: number;
    fullName: string;
    photo: string;
    isActive: boolean;
    status: DecodedValue;
    type: DecodedValue;
    typeAuto: DecodedValue;
    numberAuto: string;
    dates: {
        ordered: DateString,
        issued: DateString,
        validUntil: DateString
    };
    lastModified: string;
    lastModifiedInMs: number;
    organization: string;
    regimeStaying: DecodedValue;
    listWorkingTimes: ListWorkingTimes;
    listTerritoriesId: number[];
    parkingId: number;
    ownerId: ?number;
    response: string;
    isUsed: boolean;

    constructor(options: TOptionsPass = {
        id: 0,
        fullName: "",
        photo: "",
        isActive: "N",
        status: 533,
        type: 537,
        typeAuto: 0,
        numberAuto: "",
        dates: {
            ordered: "",
            issued: "",
            validUntil: "",
        },
        lastModified: '',
        lastModifiedInMs: 0,
        organization: "",
        regimeStaying: 523,
        listWorkingTimes: [],
        listTerritoriesId: [],
        parkingId: 0,
        ownerId: null,
        response: '',
        isUsed: false,
    }) {
        this.id = options.id;
        this.fullName = options.fullName;
        this.photo = options.photo;
        this.isActive = Pass.decodeIsActive(options.isActive);
        this.status = Pass.decodeById(options.status);
        this.type = Pass.decodeById(options.type);
        this.typeAuto = Pass.decodeById(options.typeAuto);
        this.numberAuto = options.numberAuto;
        this.dates = {
            ordered: options.dates.ordered,
            issued: options.dates.issued,
            validUntil: options.dates.validUntil,
        };
        this.lastModified = options.lastModified;
        this.lastModifiedInMs = options.lastModifiedInMs;
        this.organization = options.organization;
        this.regimeStaying = Pass.decodeById(options.regimeStaying);
        this.listWorkingTimes = options.listWorkingTimes;
        this.listTerritoriesId = options.listTerritoriesId;
        this.parkingId = options.parkingId;
        this.ownerId = options.ownerId;
        this.response = options.response;
        this.isUsed = options.isUsed;
    }

    /**
     * Максимальный срок действия договора
     *
     * @return {string}
     * @private
     */
    static get _maxValidUntil(): DateString {
        return "01.01.2099";
    }

    /**
     * Карта декодирования типа пропуска
     *
     * @return {Map}
     * @private
     */
    static get _mapDecoding(): Map<Code, DecodedValue> {
        return new Map([
            // regimeStaying
            [523, PASS_REGIME_STAYING.WORKING],
            [524, PASS_REGIME_STAYING.AROUND],
            // type
            [537, PASS_TYPE.PERSON],
            [538, PASS_TYPE.AUTO],
            [1043, PASS_TYPE.BIKE],
            // [539, PASS_TYPE.GUEST_PERSON],
            [737, PASS_TYPE.GUEST_AUTO],
            // typeAuto
            [529, PASS_TYPE_AUTO.CAR],
            [530, PASS_TYPE_AUTO.TRUCK],
            // status
            [533, PASS_STATUS.ORDERED],
            [534, PASS_STATUS.ISSUED],
            [535, PASS_STATUS.INVALID],
            [536, PASS_STATUS.REJECTED],
            [977, PASS_STATUS.BLOCKED],
            [1471, PASS_STATUS.PAUSED],
        ]);
    }

    /**
     * Кодирование значение по карте
     *
     * @param value
     * @return {number}
     */
    static codeByValue(value: DecodedValue): Code {
        let result: number = 0;
        const map = Pass._mapDecoding.entries();
        for (const [key, val] of map) {
            if (value === val) result = key;
        }
        return result;
    }

    /**
     * Декодирование по id
     *
     * @param id
     * @return {DecodedValue|string}
     */
    static decodeById(id: Code): DecodedValue | string {
        return Pass._mapDecoding.get(id) || "";
    }

    /**
     * Декодирование состояния активности
     *
     * @param val
     * @return {boolean}
     */
    static decodeIsActive(val: IsActive): boolean {
        return val === "Y";
    }

    /**
     * Кодирование состояния активности
     *
     * @param val
     * @return {string}
     */
    static encodeIsActive(val: boolean): IsActive {
        return val ? "Y" : "N";
    }

    /**
     * Получение полного типа пропуска
     *
     * @param pass - Pass
     * @return {string}
     */
    static getFullType({ typeAuto, type }: { typeAuto: string, type: string }) {
        // если тип пропуска гостевое авто,
        // обрезаем литерал строки до обычного авто
        const processedType = type.replace(/гостевое /, "");
        return `${typeAuto} ${processedType}`.trim();
    }

    /**
     * Срок действия пропуска
     *
     * @return {string}
     */
    get durationPass(): string {
        return this.dates.validUntil === Pass._maxValidUntil
            ? "Неограниченный"
            : "С ограничением";
    }

    /**
     * Полный тип пропуска
     *
     * @return {string}
     */
    get fullType(): string {
        return Pass.getFullType(this);
    }

    /**
     * Имя используемой модалки для перезаказа пропуска
     * TODO: более не надо
     * @return {string}
     */
    get nameModalForReorderPass(): ReorderPassModal | "" {
        switch (this.fullType) {
            case "Человек":
            case "Человек (разовый)":
                return "person";
            case "Легковое авто":
                return "car";
            case "Грузовое авто":
                return "truck";
            case "Велосипед":
                return "bike";
            default:
                return "";
        }
    }

    /**
     * Имя используемой компоннета для заказа пропуска
     *
     * @return {string}
     */
    get nameModalForOrderPass() {
        const { typeAuto, type } = this;
        const fullTypeWithPersonalization = `${typeAuto} ${type}`.trim();

        switch (fullTypeWithPersonalization) {
            case "Человек":
                return "person";
            case "Легковое авто":
                return "car";
            case "Грузовое авто":
                return "truck";
            case "Велосипед":
                return "bike";
            case "Легковое гостевое авто":
                return "carGuest";
            case "Грузовое гостевое авто":
                return "truckGuest";
            default:
                return "";
        }
    }

    /**
     * Имя иконки пропуска
     *
     * @return {string}
     */
    get nameIcon(): string {
        switch (this.fullType) {
            case "Человек":
            case "Человек (разовый)":
                return "person";
            case "Легковое авто":
                return "directions_car";
            case "Грузовое авто":
                return "local_shipping";
            case "Велосипед":
                return "directions_bike";
            default:
                return "";
        }
    }

    /**
   * Имя и тип иконки статуса
   *
   * @return {{}}
   */
    get iconStatus(): { name: string, type: string } {
        switch (this.status) {
            case PASS_STATUS.ORDERED:
                return { name: "hourglass_full", type: "warning" };
            case PASS_STATUS.ISSUED:
                return { name: "check_circle", type: "success" };
            case PASS_STATUS.REJECTED:
                return { name: "sync_problem", type: "warning" };
            case PASS_STATUS.PAUSED:
                return { name: "pause_circle_filled", type: "warning" };
            case PASS_STATUS.BLOCKED:
                return { name: "error", type: "error" };
            case PASS_STATUS.INVALID:
                return { name: "cancel", type: "invalid" };
            default:
                return { name: "", type: "" };
        }
    }

    /**
     * Имеются ли данные об УРВ
     *
     * @return {boolean}
     */
    get hasWorkingTimes(): boolean {
        const arr = this.listWorkingTimes;
        return arr ? arr.length > 0 : false;
    }

    /**
     * Общее время работы
     *
     * @return {string}
     */
    get totalWorkingTimes(): string {
        const { listWorkingTimes } = this;
        const total = listWorkingTimes.reduce((sum, current) => {
            return sum.add(current.durationDiff);
        }, moment.duration(0));
        const totalDays = total.days() * 24;
        return `Всего ${totalDays + total.hours()} ч за последние ${
            listWorkingTimes.length
        } дней`;
    }

    /**
     * Персонализация
     *
     * @return {string}
     */
    get personalization(): Personalization {
        // return this.ownerId && this.fullName ? "named" : "guest";
        // TODO: временное решение, пока все гостевые пропуска - колесные
        return this.type !== PASS_TYPE.GUEST_AUTO ? "named" : "guest";
    }

    /**
     * Отклонен ли пропуск
     *
     * @returns {boolean}
     */
    get isRejected(): boolean {
        return this.status === PASS_STATUS.REJECTED;
    }

    /**
     * Создание объекта с параметрами для отправки на сервер
     *
     * @param dataForm
     * @return {{}}
     */
    static createParamsApi(dataForm: Object) {
        return {
            ...(dataForm.staffMember
                ? {
                    contact_id: dataForm.staffMember.id,
                    fio: dataForm.staffMember.fullName,
                    fio_name: dataForm.staffMember.name,
                    fio_surname: dataForm.staffMember.surname,
                    fio_patname: dataForm.staffMember.patronymic,
                    photo: dataForm.staffMember.image,
                }
                : {
                    fio_name: "",
                    fio_surname: "",
                    fio_patname: "",
                }),
            pass_type: Pass.codeByValue(dataForm.type),
            auto_type: Pass.codeByValue(dataForm.typeAuto),
            pass_mode: Pass.codeByValue(dataForm.regimeStaying),
            auto_no: dataForm.numberCar,
            pass_wdraw: dataForm.durationPass,
            objects_id: dataForm.selectedTerritories.map(el => el.id),
            park_id: dataForm.selectedParking ? [dataForm.selectedParking.id] : [],
            valid_period: 528,
            comment: {
                TEXT: dataForm.comment,
                TYPE: "TEXT",
            },
        };
    }

    /**
     * Создание нового экземпляра класса пропуск по параметрам, пришедшим с сервера
     *
     * @param params - (paramsApi) - данные с сервера
     * @param ownerId - id сотрудника, которому принадлежит пропуск
     * @return {Pass}
     */
    static createOnParams(params: Object, ownerId: ?number) {
        return new Pass({
            id: params.id,
            fullName: params.fio,
            photo: params.photo,
            status: params.result,
            isActive: params.active,
            type: params.pass_type,
            typeAuto: params.auto_type,
            numberAuto: params.auto_no,
            dates: {
                ordered: params.date_create,
                issued: params.pass_issue,
                validUntil: params.pass_wdraw,
            },
            lastModified: convertDateToCommonFormat(params.timestamp_x, 'DD.MM.YYYY kk:mm:ss'),
            lastModifiedInMs: convertDateToMs(params.timestamp_x, 'DD.MM.YYYY kk:mm:ss'),
            organization: params.name,
            regimeStaying: params.pass_mode,
            listWorkingTimes: [],
            listTerritoriesId: params.objects_id || [],
            parkingId: params.park_id[0],
            ownerId: params.contact_id || ownerId,
            comment: "",
            response: params.comment ? params.comment.TEXT : '',
            isUsed: params.using,
        });
    }
}

/**
 * Подрядный пропуск
 */
export class ContractorPass extends Pass {
    // constructor(options: Object) {
    //     super(options);
    // }

    /**
     * Создание объекта с параметрами для отправки на сервер
     *
     * @param dataForm
     * @return {{}}
     */
    static createParamsApi(dataForm: Object) {
        return {
            fio_name: dataForm.person.name,
            fio_surname: dataForm.person.surname,
            fio_patname: dataForm.person.patronymic,
            pass_type: Pass.codeByValue(dataForm.type),
            auto_type: Pass.codeByValue(dataForm.typeAuto),
        };
    }
}
