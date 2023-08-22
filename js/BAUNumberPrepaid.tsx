/* eslint-disable no-shadow */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */
import {
    DuBadge,
    DuBanner,
    DuButton,
    DuDialog,
    DuHeader,
    DuHeaderProps,
    DuIcon,
    DuJumbotron,
    DuListItemStandard,
    DuOverlay,
    DuSwitch,
    DuTextInput,
  } from '@du-greenfield/du-ui-toolkit';
  import type { NativeStackScreenProps } from '@react-navigation/native-stack';
  import React, { FC, useEffect, useRef, useState } from 'react';
  import {
    Platform,
    ScrollView,
    // StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Keyboard,
    TouchableWithoutFeedback,
  } from 'react-native';
  import KeepExistingSimSheet from '../../../components/KeepExistingSim/KeepExistingSimSheet';
  import type { CustomerNavigatorParamList } from '../../../navigator';
  import {
    getMicroAppContext,
    getSalesOrder,
    microappId,
    setSalesOrder,
  } from '../../../';
  import { RootStateOrAny, useDispatch, useSelector } from 'react-redux';
  import {
    Actions,
    AddorderitemunderparentInputs,
    // OrderItems,
    PhoneNumbers,
    SelectPhoneNumberInput,
    SelectPhoneNumbers,
    UpdateOrderItemsInputs,
  } from '../../../utils/gql/models';
  import {
    addExistingOrderItemUnderParent,
    bssValidatePhoneNumber,
    addOrderItemUnderParent,
    resendOtp,
    selectPhoneNumbers,
    sendOTP,
    updateOrderItem,
    getBssListProductOfferingsPortInPhoneNumber,
    validateOtp,
    bssListDictionaryItems,
    deleteOrderItem,
    bssGetSalesOrder,
  } from '../../../utils';
  import { phoneNumberSelected } from '../../../redux/features/phoneNumbersSlice';
  // import FirestoreData from '../../../utils/rest/getFirestoreData';
  import type { OrderScreenDynamics } from '../../../api/models';
  import screen from '../../../api/services/Order';
  import type { GraphQLErrorCode, Order } from '@du-greenfield/du-commons';
  // import Modal from 'react-native-modal';
  import EsimInfo from '../../../components/EsimInfo/EsimInfo';
  import { useEnvironmentAbstract } from '@du-greenfield/du-abstract-environment-plugin';
  import testIds, { setTestID } from '../../../assets/support/testIds';
  import AlertComponent from '../../../components/AlertComponent';
  import OTPComponentSheet from '../../../components/OTPComponentSheet/OTPComponentSheet';
  import PortInSuccessComponent from '../../../components/PortInSuccessComponent/PortInSuccessComponent';
  import PortinErrorComponent from '../../../components/PortinErrorComponent/PortinErrorComponent';
  import BottomSheet from '../../../components/RawBottomSheet/BottomSheet';
  import {
    getBssListChildProductOfferings,
    getBssListProductOfferings,
  } from '../YourAssignedNumber/YourAssignedNumberControls';
  // import { useSafeAreaInsets } from 'react-native-safe-area-context';
  import {
    DuAnalyticsPlugin,
    DuAnalyticsTagBuilder,
  } from '@du-greenfield/du-analytics-plugin-core';
  import DuAnalyticsFirebasePlugin from '@du-greenfield/du-firebase-analytics';
  import { setsalesOrder} from '../../../redux/features/configSlice';
  
  type BAUNumberPrepaidProps = NativeStackScreenProps<
    CustomerNavigatorParamList,
    'BAUNumberPrepaid'
  > & {
    unitTest: boolean;
    navigateToShipping: (
      isFromCheckOut?: boolean,
      isBAUNumberUpdate?: boolean
    ) => void;
    navigateToCart: () => void;
    // onClickLearnmore: () => void;
    isEsimSupportedDevice: boolean;
  } & { planType?: string };
  
  interface ReservedTimePeriod {
    unit: string;
    value: string;
  }
  
  export const getStatusBar: any = (OS: string) => {
    if (OS === 'ios') {
      return { barStyle: 'default', backgroundColor: 'white' };
    } else {
      return { barStyle: 'dark-content', backgroundColor: 'white' };
    }
  };
  
  export enum NumberExpiredStates {
    NOTEXPIRED = 'not expired',
    LESSTHANFOURHOURSTOEXPIRE = 'less than four hours to expire',
    EXPIRED = 'expired',
  }
  export type NumberExpiredState = {
    expiredState:
      | NumberExpiredStates.NOTEXPIRED
      | NumberExpiredStates.LESSTHANFOURHOURSTOEXPIRE
      | NumberExpiredStates.EXPIRED;
  };
  
  export type CommonType = {
    isClear: boolean;
    isError: boolean;
    maxLength: number;
  };
  
  export type TextWithSufixIconProps = {
    text: string;
    icon: string;
  };
  
  /* istanbul ignore next */
  const BAUNumberPrepaid: FC<BAUNumberPrepaidProps> = ({
    navigation,
    unitTest,
    navigateToShipping,
    isEsimSupportedDevice,
    navigateToCart,
    // onClickLearnmore,
    // planType = 'Postpaid',
  }) => {
    const localizationData = useSelector((state: any) => state.configSlice);
    const [isSheetOpen, setSheetOpen] = useState<boolean>(unitTest);
    const [isExistingSheetOpen, setExistingSheetOpen] =
      useState<boolean>(unitTest);
    const [formatedText, setFormatedText] = useState<string>('');
    const [isOTPComponentsOpen, setOTPComponentsOpen] = useState<boolean>(false);
    const [isEsimInfoVisible, setEsimInfoVisible] = useState<boolean>(unitTest);
    const [isLearnMoreContent, setLearnmoreContent] = useState<boolean>(false);
  
    const [data, setData] = useState<CommonType>({
      isClear: unitTest,
      isError: unitTest,
      maxLength: 11,
    });
    const [remainingSecondsToExpire, setRemainingSecondsToExpire] =
      useState<number>(36000);
  
    const [reservedTimePeriod, setReservedTimePeriod] =
      useState<ReservedTimePeriod>({ unit: '', value: '' });
    const [
      noAvailableNumbersAlertVisibility,
      setNoAvailableNumbersAlertVisibility,
    ] = useState<boolean>(false);
    const [phoneNumbersPayload, setPhoneNumbersPayload] = useState<
      SelectPhoneNumbers | undefined
    >(undefined);
    const [selectedRandomId, setSelectedRandomId] = useState<number>(0);
    const [characteristics_name, setcharacteristics_name] = useState<string>('');
    const [orderScreenDynamics, setOrderScreenDynamics] = useState<
      OrderScreenDynamics | undefined
    >(undefined);
    const [emSimSwitchCheck, setEmSimSwitchCheck] = useState(
      isEsimSupportedDevice
    );
    const [disabledBtn, setDisabledBtn] = useState<boolean>(false);
    const [numberExpiredState, setNumberExpiredState] =
      useState<NumberExpiredState>({
        expiredState: NumberExpiredStates.NOTEXPIRED,
      });
    const [isFromCheckOut] = useState<boolean | undefined>(false);
    const [phoneNumberLocked, setPhoneNumberLocked] = useState<boolean>(false);
    const [overlayVisibility, setOverlayVisibility] = useState<boolean>(false);
    const [selectedIndex, setSelectedIndex] = useState<number>(0);
    const [renderID, setRenderID] = useState<number>(0);
    let idArray: Array<string> = [];
  
    const dispatch = useDispatch();
    const intervalRef = useRef<NodeJS.Timer | null>(null);
    /* istanbul ignore next */
    const phoneNumbers = useSelector(
      (state: RootStateOrAny) => state.phoneNumberSlice
    );
    const [error] = useState<GraphQLErrorCode>();
    const [msisdn, setMsisdn] = useState('');
    const [otpTemplateId] = useState('TemplateID');
    const [otpReferenceId, setOtpReferenceId] = useState('otpReferenceId');
    const [otpExpireTime, setOtpExpireTime] = useState('2007-12-03T10:15:30Z');
    const [isVisibleAlert, setIsVisibleAlert] = useState(false);
    const [portInSuccessVisible, setPortInSuccessVisible] = useState(false);
    const [portInErrorVisible, setPortInErrorVisible] = useState(false);
    const [offeringID, setOfferingID] = useState<string>('');
    const [/*upIsUgradeModal*/, setISUpgradeModal] = useState(false);
    const [/*isKeyboardVisible*/, setKeyboardVisible] = useState(false);
    const [isValidPrepaidNumber, setIsValidPrepaidNumber] = useState(false);
    const [updateOrderItemIdForEsim, setUpdateOrderItemIdForEsim] = useState<
      null | string
    >(null);
    const [isDIP, setIsDIP] = useState<boolean>(true);
  
    const env = useEnvironmentAbstract(
      [microappId],
      getMicroAppContext()?.appLanguage!,
      getMicroAppContext()?.appType
    );
    const ListItem = [
      {
        key: 1,
        title: env?.keep_existing_number_text,
        subTitle:
          env?.port_in_to_du_with_your_existing_virgin_or_etisalat_number_text,
      },
      {
        key: 2,
        title: env?.upgrade_to_postpaid_text,
        subTitle: env?.change_to_a_postpaid_plan_using_your_existing_number_text,
      },
    ];
  
    useEffect(() => {
      const keyboardDidShowListener = Keyboard.addListener(
        'keyboardDidShow',
        () => {
          setKeyboardVisible(true); // or some other action
        }
      );
      const keyboardDidHideListener = Keyboard.addListener(
        'keyboardDidHide',
        () => {
          setKeyboardVisible(false); // or some other action
        }
      );
      return () => {
        keyboardDidHideListener.remove();
        keyboardDidShowListener.remove();
      };
    }, []);
  
    /* istanbul ignore next */
    const DUHeaderProps: DuHeaderProps = {
      //@ts-ignore
      leftButtonTestID: 'DH_TEST',
      safeArea: true,
      right: 'interactive',
      left: 'back',
      interactiveIcons: [
        {
          icon: { iconName: 'help-icon', iconSize: 20 },
          pressed: () => {
            console.log('pressed help');
          },
        },
        {
          icon: { iconName: 'cart-pro', iconSize: 20 },
          pressed: () => {
            console.log('pressed navigate to cart');
            navigateToCart && navigateToCart();
          },
        },
      ],
      leftPressed: () => {
        navigation.goBack();
      },
      rightTertiaryHelp: {
        disable: false,
      },
      statusBar: getStatusBar(Platform.OS),
      // title: 'Choose number',
      background: 'white',
    };
  
    useEffect(() => {
      return () => {
        setMsisdn(formatedText.trim());
      };
    }, [formatedText]);
  
    /* istanbul ignore next */
    async function UpdateOrderItem() {
      let requestInput: UpdateOrderItemsInputs = {
        salesOrderId: getSalesOrder().salesOrderId,
        itemCharacteristics: [
          {
            orderItemId: updateOrderItemIdForEsim!,
            characteristics: {
              name: 'SIM card type',
              value: emSimSwitchCheck ? 'eSIM' : 'Physical SIM',
            },
          },
        ],
      };
      const updateOrderItemResponse = await updateOrderItem(requestInput);
      return updateOrderItemResponse;
    }
  
    useEffect(() => {
      getData();
      getIdArray();
      fetchData();
    }, []);
  
    /* istanbul ignore next */
    async function fetchData() {
      setPhoneNumbersPayload(undefined);
      setOrderScreenDynamics(await screen.getScreenDynamics());
    }
  
    /* istanbul ignore next */
    const getData = async () => {
      // const response = await FirestoreData.getVariables();
      setcharacteristics_name('MSISDN ported');
    };
  
    /* istanbul ignore next */
    const getIdArray = async () => {
      const response: any = await getBssListProductOfferings();
      if (response) {
        fetchListChildProductOfferings();
      }
    };
  
    const fetchListChildProductOfferings = async () => {
      const response: any = await getBssListChildProductOfferings();
      if (response.bssListProductOfferings) {
        setOfferingID(response.bssListProductOfferings[0].id);
        selectRandomPhoneNumber(
          Actions.RANDOM,
          1,
          response.bssListProductOfferings[0].id
        );
      }
    };
  
    /* istanbul ignore next */
    function generatePhoneNumbers(response: any) {
      dispatch(
        phoneNumberSelected({
          phoneNumber:
            response.phoneNumbers[selectedRandomId].phoneNumber.phoneNumber,
        })
      );
      if (selectedRandomId !== response.phoneNumbers.length - 1) {
        setSelectedRandomId((prev: number) => prev + 1);
      } else {
        setSelectedRandomId(0);
      }
    }
  
    /* istanbul ignore next */
    async function selectRandomPhoneNumber(
      action: Actions,
      qty?: number,
      OffID?: string,
      oldPhoneNumbers?: PhoneNumbers
    ) {
      let requestInput: SelectPhoneNumberInput = {
        action: action,
        quantity: qty,
        salesOrderId: getSalesOrder().salesOrderId,
        // @ts-ignore
        customerId:
          getMicroAppContext().customer?.type === 'loggedin'
            ? getMicroAppContext().meData?.data.me[0].id
            : getSalesOrder().customer.id,
        productOfferingId: OffID!,
        parentOrderItemId: getSalesOrder().orderItemId!,
        vipCategoryIds: oldPhoneNumbers ? undefined : idArray,
        phoneNumbers: oldPhoneNumbers,
      };
  
      const response = await selectPhoneNumbers(requestInput);
      if (response) {
        console.log('selectPhoneNumbers RANDOM RESPONSE:::', response?.data);
        if (
          response.data.selectPhoneNumbers.phoneNumbers.length <= 0 ||
          response.data.selectPhoneNumbers.phoneNumbers == null
        ) {
          setNoAvailableNumbersAlertVisibility(true);
          return;
        }
        setPhoneNumbersPayload(response);
        generatePhoneNumbers(response.data.selectPhoneNumbers);
        let reservationDate =
          response.data.selectPhoneNumbers.phoneNumbers[0].phoneNumber
            .reservationPeriod;
        setRemainingSecondsToExpire(
          new Date(reservationDate as any).getTime() +
            12 * 60 * 60 * 1000 -
            new Date().getTime()
        );
        let timeUnit = response.data.selectPhoneNumbers.reservationPeriod?.unit;
  
        let timeValue = response.data.selectPhoneNumbers.reservationPeriod?.value;
  
        setReservedTimePeriod({
          unit: timeUnit === 'hour' ? 'hours' : 'minutes',
          value: timeValue!,
        });
  
        const salesOrder: Order = {
          ...getSalesOrder(),
          //@ts-ignore
          productOffering: { ...getSalesOrder().productOffering, numberOfferingId: OffID! },
          msisdn: {
            ...getSalesOrder().msisdn!,
            msisdn:
              response.data.selectPhoneNumbers.phoneNumbers[0].phoneNumber
                .phoneNumber!,
            reservationDate:
              response.data.selectPhoneNumbers.phoneNumbers[0].phoneNumber
                .reservationDate,
            msisdnId:
              response.data.selectPhoneNumbers.phoneNumbers[0].phoneNumber.id!,
            orderItemID:
              response.data.selectPhoneNumbers.phoneNumbers[0].orderItemId!,
          },
        };
        setSalesOrder(salesOrder);
        for (let phoneNumberObject of response.data.selectPhoneNumbers
          .phoneNumbers) {
          if (phoneNumberObject.phoneNumber.status == 'RESERVED') {
            setPhoneNumberLocked(false); // TODO: waiting api
          }
        }
        fetchGetSalesOrder();
      }
    }
  
    const fetchGetSalesOrder = async () => {
      const response = await bssGetSalesOrder(getSalesOrder().salesOrderId, true);
      if (response) {
        let orderitemidForUpdate = response.orderItems.find((item) =>
          item.orderItems.find(
            (item2) => item2.offer.name == 'Primary SIM Card - Postpaid'
          )
        );
        let orderitemidForUpdates = orderitemidForUpdate?.orderItems?.find(
          (item2) => item2?.offer?.name == 'Primary SIM Card - Postpaid'
        );
        setUpdateOrderItemIdForEsim(orderitemidForUpdates?.id);
        const checkItem = response.orderItems.find(
          (i) =>
            i.id === getSalesOrder().orderItemId &&
            Object.keys(i.chars).some((i) => i === 'Plan type') &&
            i.chars['Plan type'] === 'Postpaid'
        );
        const item = checkItem.orderItems.find(
          (i) =>
            Object.keys(i.chars).some((i) => i === 'Equipment type') &&
            i.chars['Equipment type'] === 'SIM card'
        );
        const salesOrder: Order = {
          ...getSalesOrder(),
          simCardOrderItemId: item.id,
        };
        setSalesOrder(salesOrder);
  
        const OrderItemList = response?.orderItems;
        if (OrderItemList) {
          // const PhonePlusPlans = OrderItemList.filter((i: OrderItems) => {
          //   return (
          //     Object.keys(i.chars).some((i) => i === 'Plan type') &&
          //     i.chars['Plan type'] === planType
          //   );
          // }).filter((i) =>
          //   i.orderItems.some((i) => i.chars['Equipment type'] === 'Smartphones')
          // );
  
          const DeviceOnly = OrderItemList.filter((i) => {
            return (
              i.orderItems && !Object.keys(i.chars).some((i) => i === 'Plan type')
            );
          }).filter((i) =>
            i.orderItems.some((i) => {
              return i.chars['Equipment type'] === 'Smartphones';
            })
          );
  
          const AccessoriesOnly = OrderItemList.filter((i) => {
            return (
              i.orderItems && !Object.keys(i.chars).some((i) => i === 'Plan type')
            );
          }).filter((i) =>
            i.orderItems.some((i) => {
              return i.chars['Equipment type'] === 'Accessories';
            })
          );
  
          // const PhonePlusPlansWithInstallments = PhonePlusPlans.some((i) =>
          //   i.orderItems.some(
          //     (item) => item.chars['Sale type'] === 'Installments'
          //   )
          // );
          const DeviceOnlyWithInstallments = DeviceOnly.some((i) =>
            i.orderItems.some(
              (item) => item.chars['Sale type'] === 'Installments'
            )
          );
          const AccessoriesOnlyWithInstallments = AccessoriesOnly.some((i) =>
            i.orderItems.some(
              (item) => item.chars['Sale type'] === 'Installments'
            )
          );
          if (
            // PhonePlusPlansWithInstallments ||
            DeviceOnlyWithInstallments ||
            AccessoriesOnlyWithInstallments
          ) {
            console.log('=================================100 yes DIP');
            setIsDIP(true);
          } else {
            console.log('=================================100 not DIP');
            setIsDIP(false);
          }
        }
      }
    };
  
    /* istanbul ignore next */
    const addExistingOrder = async (
      _typenumber: any,
      __: any,
      carrier: any,
      portNumber?: string
    ) => {
      try {
        const response = await getBssListProductOfferingsPortInPhoneNumber();
        if (response?.bssListProductOfferings) {
          if (carrier === 'Etisalat') {
            setOTPComponentsOpen(true);
            setExistingSheetOpen(false);
  
            const otpresponse = await sendOTP(
              new Date().toString(),
              'du', //senderPhoneNumber
              addNewPrepaidNumber(
                formatedText.split(' ', formatedText.length).join('')
              ), //receiverPhoneNumber
              otpTemplateId
            );
            if (otpresponse) {
              setOtpReferenceId(otpresponse.sendOtp.otpReferenceId);
              setOtpExpireTime(otpresponse.sendOtp.expiryTime);
            }
          } else if (carrier === 'Virgin') {
            let bssListDictionaryItemsRes = await bssListDictionaryItems();
            let requestInput: AddorderitemunderparentInputs = {
              orderItemId: getSalesOrder()?.orderItemId!,
              productOffering: {
                id: response?.bssListProductOfferings[0].id,
                characteristics: [
                  {
                    name: 'MSISDN ported',
                    value: '971' + _typenumber.toString().replace(' ', '') ?? '',
                  },
                  {
                    name: 'Carrier',
                    value: bssListDictionaryItemsRes
                      ? bssListDictionaryItemsRes?.bssListDictionaryItems?.find(
                          (i: any) => i.originalName === 'Virgin'
                        )?.id
                      : '9155890975613404789',
                  },
                ],
              },
            };
            await addExistingOrderItemUnderParent(requestInput);
            navigateToShipping && navigateToShipping(false, false);
          } else {
            let bssListDictionaryItemsRes = await bssListDictionaryItems();
            let requestInput: AddorderitemunderparentInputs = {
              orderItemId: getSalesOrder()?.orderItemId!,
              productOffering: {
                id: response?.bssListProductOfferings[0].id,
                characteristics: [
                  { name: 'MSISDN ported', value: portNumber },
                  {
                    name: 'Carrier',
                    value: bssListDictionaryItemsRes
                      ? bssListDictionaryItemsRes?.bssListDictionaryItems?.find(
                          (i: any) => i.originalName == 'Du'
                        )?.id
                      : '9155890975613404789',
                  },
                ],
              },
            };
            console.log('MSISDN ported NUMBER::', portNumber);
            console.log(
              'requestInputaddExistingOrderItemUnderParent:::',
              requestInput
            );
            await addExistingOrderItemUnderParent(requestInput);
          }
          //@ts-ignore
          const salesOrder: Order = { ...getSalesOrder(), productOffering: { ...getSalesOrder().productOffering, numberOfferingId: response?.bssListProductOfferings[0].id } }
          setSalesOrder(salesOrder);
        }
      } catch (e) {
        console.log('test.....326', e);
      }
    };
  
    /* istanbul ignore next */
    useEffect(() => {
      if (remainingSecondsToExpire == 0) {
        setNumberExpiredState({ expiredState: NumberExpiredStates.EXPIRED });
        setPhoneNumberLocked(false);
        return;
      } else {
        let remaingTimeInHours = Math.floor(remainingSecondsToExpire / 3600000);
        if (remaingTimeInHours < 4) {
          setNumberExpiredState({
            expiredState: NumberExpiredStates.LESSTHANFOURHOURSTOEXPIRE,
          });
        } else {
          setNumberExpiredState({ expiredState: NumberExpiredStates.NOTEXPIRED });
        }
      }
  
      const timer = setTimeout(() => {
        setRemainingSecondsToExpire(remainingSecondsToExpire - 1);
      }, 1000);
  
      intervalRef.current = timer;
      return () => {
        clearInterval(intervalRef.current!);
      };
    }, [remainingSecondsToExpire]);
  
    /* istanbul ignore next */
    const checkNumberValidity = () => {
      if (
        (msisdn.startsWith('0') && msisdn.length == 10) ||
        (msisdn.startsWith('5') && msisdn.length == 9)
      ) {
        return true;
      } else {
        return false;
      }
    };
  
    // const onModalClosePress = () => {
    //   setISUpgradeModal(false);
    // };
  
    // const headerProps: DuHeaderProps = {
    //   right: 'tertiary',
    //   rightTertiary: {
    //     text: env?.close_text,
    //     pressed: () => onModalClosePress(),
    //   },
    //   statusBar:
    //     Platform.OS === 'ios'
    //       ? { barStyle: 'default', backgroundColor: 'white' }
    //       : { barStyle: 'dark-content', backgroundColor: 'white' },
    //   background: 'white',
    // };
  
    // /* istanbul ignore next */
    // const checkPortIn = async () => {
    //   if (!checkNumberValidity()) {
    //     setSheetOpen(false);
    //     // setStatus(AlertStatus.INVALID_PREPAID_NUMBER);
    //     setIsVisibleAlert(true);
    //   } else {
    //     const response = await bssValidatePhoneNumber(
    //       'MobilePhoneNumber',
    //       addNewPrepaidNumber(
    //         formatedText.split(' ', formatedText.length).join('')
    //       )
    //     );
    //     if (response.code === 200) {
    //       await addExistingOrder(msisdn, 'MSISDN ported', 'du');
    //       setSheetOpen(false);
    //       setISUpgradeModal(false);
    //     } else if (
    //       response?.data?.errors[0]?.code == 'itf_043' &&
    //       response.code == 500
    //     ) {
    //       setIsValidPrepaidNumber(true);
    //     } else {
    //       setISUpgradeModal(false);
    //     }
    //   }
    // };
  
    function addNewPrepaidNumber(number: string) {
      if (number.charAt(0) === '0') {
        return '971' + number.slice(1);
      } else {
        return '971' + number;
      }
    }
    const checkPortInScenario = async () => {
      if (!checkNumberValidity()) {
        setSheetOpen(false);
        // setStatus(AlertStatus.INVALID_PREPAID_NUMBER);
        setIsVisibleAlert(true);
      } else {
        const response = await bssValidatePhoneNumber(
          'MobilePhoneNumber',
          addNewPrepaidNumber(
            formatedText.split(' ', formatedText.length).join('')
          )
        );
        if (response.code === 200) {
          let credentials = {
            orderItemId:
              phoneNumbersPayload?.data.selectPhoneNumbers.phoneNumbers[0]
                .orderItemId ?? '',
          };
          console.log(
            'deleteOrderItem ORDER ITEM ID CREDENTIALS::::',
            credentials
          );
          await deleteOrderItem(credentials);
          await addExistingOrder(
            msisdn,
            'MSISDN ported',
            'du',
            addNewPrepaidNumber(
              formatedText.split(' ', formatedText.length).join('')
            )
          );
          setSheetOpen(false);
          setISUpgradeModal(false);
          navigateToShipping && navigateToShipping(isFromCheckOut, true);
        } else if (
          response?.data?.errors[0]?.code == 'itf_043' &&
          response.code == 500
        ) {
          setIsValidPrepaidNumber(true);
        } else {
          setISUpgradeModal(false);
        }
      }
    };
    /* istanbul ignore next */
    const upgradeToPrepaidHandler = (text: any) => {
      const formattedMSISDN = text.trim();
      if (formattedMSISDN) {
        if (formattedMSISDN[0] === '0') {
          setData({
            ...data,
            isError: false,
            isClear: true,
            maxLength: 12,
          });
          setFormatedText(
            formattedMSISDN
              .replace(/[^\dA-Z]/g, '')
              .replace(/(\d{3})(?=\d{3})(?=\d{4})/g, '$1 ')
          );
        } else if (formattedMSISDN[0] === '5') {
          setData({
            ...data,
            isError: false,
            isClear: true,
            maxLength: 11,
          });
          setFormatedText(
            formattedMSISDN
              .replace(/[^\dA-Z]/g, '')
              .replace(/(\d{3})(?=\d{3})(?=\d{3})/g, '$1 ')
          );
        } else {
          setData({ ...data, isError: true, isClear: false });
        }
      } else {
        // :: Do the number Validation part here
        setData({ ...data, isError: false, isClear: false });
      }
    };
  
    /* istanbul ignore next */
    const onShufflePress = () => {
      onEventPress({type:'button',typeName:'click – shuffle'})
      // @ts-ignore
      const oldPhoneNumber: PhoneNumbers = {
        oldPhoneNumberId: getSalesOrder()?.msisdn?.msisdnId!,
        orderItemId: getSalesOrder().msisdn?.orderItemID,
      };
      setDisabledBtn(true);
      selectRandomPhoneNumber(
        Actions.SHUFFLE,
        undefined,
        offeringID,
        oldPhoneNumber
      );
      setDisabledBtn(false);
    };
  
    const deleteExisingOrder = async () => {
      // @ts-ignore
      await deleteOrderItem({
        orderItemId: getSalesOrder().msisdn?.orderItemID?.toString()!,
      });
    };
  
    const logAddToCart = () => {
      let tagBuilder = new DuAnalyticsTagBuilder();
  
      let item = tagBuilder
        .itemId(getSalesOrder().product.id.toLowerCase())
        .itemName(getSalesOrder().product.name.toLowerCase())
        .itemBrand('du')
        .itemCategory3(emSimSwitchCheck ? 'e-sim' : "p-sim")
        .itemCategory4(`${getSalesOrder().product.plan.data} gb`)
        .itemCategory5(`${getSalesOrder().product.plan.duration} months`)
        .price(getSalesOrder().product.plan.price.amount)
        .quantity(1)
        .build()
  
      let params = {
        journey_name: 'postpaid - consumer app',
        sub_journey_name: `postpaid only : ${phoneNumbers?.phoneNumber?.phoneNumber}`,
        currency: 'aed',
        value: getSalesOrder().product.plan.price.amount,
        items: [item]
      }    
      let analytics: DuAnalyticsPlugin = new DuAnalyticsFirebasePlugin();
      analytics.logEvent('add_to_cart', params);
    }
  
    const bannerOnClick = () => {
      setLearnmoreContent(true);
      setEsimInfoVisible(true);
    };
  
    const logRemoveFromCart = () => {
      let tagBuilder = new DuAnalyticsTagBuilder();
  
      let item = tagBuilder
        .itemId(getSalesOrder().product.id.toLowerCase())
        .itemName(getSalesOrder().product.name.toLowerCase())
        .itemBrand('du')
        .itemCategory3(emSimSwitchCheck ? 'e-sim' : "p-sim")
        .itemCategory4(`${getSalesOrder().product.plan.data} gb`)
        .itemCategory5(`${getSalesOrder().product.plan.duration} months`)
        .price(getSalesOrder().product.plan.price.amount)
        .quantity(1)
  
      let params = {
        journey_name: 'postpaid - consumer app',
        sub_journey_name: `postpaid only : ${phoneNumbers?.phoneNumber?.phoneNumber}`,
        currency: 'aed',
        value: getSalesOrder().product.plan.price.amount,
        items: [item]
      }
      let analytics: DuAnalyticsPlugin = new DuAnalyticsFirebasePlugin();
      analytics.logEvent('remove_from_cart', params);
    }
    console.log('getSalesOrder',getSalesOrder());
    
    const onEventPress = ({ type, typeName }: { type: string, typeName: string }) => {
      let tagBuilder = new DuAnalyticsTagBuilder();
      let params = tagBuilder
        .journeyName('postpaid - consumer app')
        .subJourneyName(`postpaid only : ${phoneNumbers?.phoneNumber?.phoneNumber}`)
        .pageType('choose number page')
        .clickCtaName(typeName)
        .clickCtaType(type)
        .planId(getSalesOrder().product.id.toLowerCase())
        .planName(getSalesOrder().product.name.toLowerCase())
        .build()
        console.log('params',params);
        
      let analytics: DuAnalyticsPlugin = new DuAnalyticsFirebasePlugin();
      analytics.logEvent('click_cta', params);      
    }
  
    const proceedToCart = async () => {
      await UpdateOrderItem();
      navigateToShipping && navigateToShipping(isFromCheckOut, false);
      logAddToCart();
    };
  
    const callNavigateHandleFun = async (
      state: number,
      msisdn: string,
      isTOSChecked: boolean
    ) => {
      Keyboard.dismiss();
      if (state === 1 && isTOSChecked) {
        // Etisalate confirm
        addExistingOrder(msisdn, 'MSISDN ported', 'Etisalat');
      } else {
        // let orderUnderItem = await addOrderItemUnderParent(
        //   getSalesOrder()!.orderItemId || '',
        //   productOfferingId,
        //   phoneNumbersPayload?.selectPhoneNumbers.phoneNumbers[0]
        //     .phoneNumber.id!,
        //   characteristics_name,
        //   '9155890975613404789',
        //   'Carrier'
        // );
        // if (orderUnderItem === undefined) {
        //   console.log("line number 708---------------------------------");
        //   setTimeout(function () {
        //     setPortInErrorVisible(true);
        //   }, 400);
        // } else {
        //   console.log("line number 713---------------------------------");
        //   setExistingSheetOpen(false);
        //     navigateToShipping && navigateToShipping(false, false);
        // }
      }
    };
    return (
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        <DuHeader
          {...setTestID(testIds?.BAUNumberPrepaidDuHeader)}
          {...DUHeaderProps}
        />
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text
            style={{
              alignSelf: 'center',
              fontSize: 36,
              fontFamily: 'Inter-Bold',
              lineHeight: 40,
            }}
            {...setTestID(`${testIds.BauNuberPrepaidV2ChooseNumberText}_`)}
          >
            {env?.choose_number_common_text}
          </Text>
          <View
            style={{
              borderRadius: 12,
              borderColor: '#C2C6CE',
              borderWidth: 1,
              margin: 15,
              padding: 15,
            }}
            {...setTestID(`${testIds.BauNuberPrepaidV2View1}_`)}
          >
            <View style={{ flexDirection: 'row' }}>
              <View style={{ flex: 1 }}>
                <DuJumbotron
                  {...setTestID(testIds?.BAUNumberPrepaidDuJumbotron1)}
                  //@ts-ignore
                  mainTextFontWeight={'700'}
                  mainJumbotron={
                    orderScreenDynamics?.fields.assigned_number_model.mapValue
                      .fields.heading.mapValue.fields.en.mapValue.fields
                      .plain_text?.stringValue === 'New number'
                      ? 'Your number'
                      : orderScreenDynamics?.fields.assigned_number_model.mapValue
                          .fields.heading.mapValue.fields.en.mapValue.fields
                          .plain_text?.stringValue
                  }
                  mainTextlineSpaceSize={20}
                  mainTextSize={18}
                  mainTextLetterSpacing={-0.2}
                />
              </View>
              {phoneNumbersPayload?.data.selectPhoneNumbers.phoneNumbers[0] &&
                phoneNumbersPayload?.data.selectPhoneNumbers.phoneNumbers[0]
                  .phoneNumber.vipCategory?.name !== 'Regular' && (
                  <DuBadge
                    gradientEnabled
                    gradientColors={['#DB9E43', '#AC7103']}
                    type={'primary'}
                    foregroundStyle={{ fontWeight: '500' }}
                    gradientText={'Gold number'}
                  />
                )}
            </View>
  
            <View style={{ marginVertical: 5 }}>
              <DuJumbotron
                {...setTestID(testIds?.BAUNumberPrepaidDuJumbotron2)}
                mainJumbotron={
                  phoneNumbersPayload && phoneNumbers?.phoneNumber?.phoneNumber
                }
                //@ts-ignore
                mainTextSize={26}
                disabled={
                  numberExpiredState.expiredState == NumberExpiredStates.EXPIRED
                    ? true
                    : false
                }
                mainTextFontWeight={'800'}
                mainTextColor={phoneNumberLocked ? '#B9BDC6' : '#041333'}
              />
            </View>
  
            <View
              style={{
                flexDirection: 'row',
                flex: 1,
                justifyContent: 'space-between',
              }}
              {...setTestID(`${testIds.BauNuberPrepaidV2View2}_`)}
            >
              <DuButton
                {...setTestID(testIds?.BAUNumberPrepaidDuButton4)}
                type="secondary"
                title={
                  numberExpiredState.expiredState === NumberExpiredStates.EXPIRED
                    ? env?.find_a_new_number_text
                    : env?.browse_numbers_text
                }
                size="small"
                onPress={() => {
                  onEventPress({ type: 'button', typeName: 'click – browse number' })
                  //if you are micro app level running plz uncomment the line otherwise keep it like this commented
                  // navigation.navigate('ChooseMSIDNScreen');
                  dispatch(setsalesOrder(getSalesOrder()))
                  navigation.navigate('ChooseMSIDNScreen');
                }}
                disabled={!phoneNumbersPayload}
              />
              <DuButton
                {...setTestID(testIds?.BAUNumberPrepaidDuButton2)}
                type="teritary"
                title={
                  orderScreenDynamics?.fields.assigned_number_model.mapValue
                    .fields.lines.arrayValue.values[0].mapValue.fields.shuffle
                    .mapValue.fields.en.mapValue.fields.plain_text?.stringValue
                }
                size="small"
                containerStyle={{
                  left: 8,
                }}
                iconContainerStyle={{ marginRight: -5 }}
                disabled={disabledBtn}
                icon={{ iconName: 'refresh' }}
                onPress={onShufflePress}
              />
            </View>
  
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                flex: 1,
                justifyContent: 'space-between',
                marginTop: 8,
              }}
              {...setTestID(`${testIds.BauNuberPrepaidV2View3}_`)}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text
                  style={{
                    fontSize: 14,
                    color: phoneNumberLocked ? '#B9BDC6' : '#3B4559',
                    marginRight: 5.67,
                    fontFamily: 'Inter-Regular',
                  }}
                  {...setTestID(`${testIds.BauNuberPrepaidV2View4}_`)}
                >
                  {env?.proceed_with_esim_text}
                </Text>
                <TouchableOpacity
                  {...setTestID(
                    `${testIds.BauNuberPrepaidV2ChooseNumberText}_${''}`
                  )}
                  onPress={
                    /* istanbul ignore next */
                    () => {
                      if (phoneNumberLocked) {
                        navigation.navigate('EsimDevicesScreen' as never);
                      }
                    }
                  }
                >
                  <DuIcon
                    {...setTestID(`${testIds.BauNuberPrepaidV2icon1}_`)}
                    iconName={'info'}
                    onPress={() => {
                      setEsimInfoVisible(!isEsimInfoVisible);
                    }}
                    artWorkHeight={24}
                    artWorkWidth={24}
                    iconColor={phoneNumberLocked ? '#B9BDC6' : '#677084'}
                    // iconColor={'#B9BDC6'}
                  />
                </TouchableOpacity>
              </View>
              <View style={{ marginBottom: 8 }}>
                <DuSwitch
                  {...setTestID(testIds?.BAUNumberPrepaidDuSwitch)}
                  disabled={false}
                  value={emSimSwitchCheck}
                  onValueChange={
                    /* istanbul ignore next */
                    () => {
                      onEventPress({ type: 'button', typeName: 'proceed with esim' })
                      setEmSimSwitchCheck((previousState) => !previousState)
                    }
                  }
                />
              </View>
            </View>
  
            <View>
              {numberExpiredState.expiredState ===
                NumberExpiredStates.NOTEXPIRED && (
                <TouchableOpacity
                  onPress={() => {
                    bannerOnClick();
                  }}
                >
                  <DuBanner
                    {...setTestID(testIds?.BAUNumberPrepaidDuBanner1)}
                    buttontitle=""
                    iconPosition="top"
                    icon={{
                      iconName: 'info',
                      iconColor: '#181C24',
                      artWorkHeight: 23.33,
                      artWorkWidth: 23.33,
                    }}
                    title={`${env?.bau_number_banner_title} ${reservedTimePeriod.value} ${reservedTimePeriod.unit} `}
                    type="default"
                    onPress={() => {
                      console.log('========!!');
                    }}
                  />
                </TouchableOpacity>
              )}
              {numberExpiredState.expiredState ===
                NumberExpiredStates.EXPIRED && (
                <TouchableOpacity
                  onPress={() => {
                    bannerOnClick();
                  }}
                >
                  <DuBanner
                    {...setTestID(testIds?.BAUNumberPrepaidDuBanner1)}
                    buttontitle=""
                    iconPosition="top"
                    icon={{
                      iconName: 'info',
                      iconColor: '#BA0023',
                      artWorkHeight: 23.33,
                      artWorkWidth: 23.33,
                    }}
                    titlestyle={{
                      fontSize: 14,
                      lineHeight: 20,
                      color: '#181C24',
                      fontFamily: 'Inter-Medium',
                    }}
                    title={env?.number_expired_find_new_common_text}
                    type="danger"
                    onPress={() => {
                      console.log('========!!2');
                    }}
                  />
                </TouchableOpacity>
              )}
              {numberExpiredState.expiredState ===
                NumberExpiredStates.LESSTHANFOURHOURSTOEXPIRE && (
                <TouchableOpacity
                  onPress={() => {
                    bannerOnClick();
                  }}
                >
                  <DuBanner
                    {...setTestID(testIds?.BAUNumberPrepaidDuBanner3)}
                    buttontitle=""
                    iconPosition="top"
                    icon={{
                      iconName: 'info',
                      iconColor: '#C79C02',
                      artWorkHeight: 23.33,
                      artWorkWidth: 23.33,
                    }}
                    titlestyle={{
                      fontSize: 14,
                      lineHeight: 20,
                      marginTop: -5,
                      fontFamily: 'Inter-Regular',
                    }}
                    title={env?.expire_soon_keep_it_text}
                    type="warning"
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
  
          {!isDIP &&
            phoneNumbersPayload?.data.selectPhoneNumbers.phoneNumbers[0] &&
            phoneNumbersPayload?.data.selectPhoneNumbers.phoneNumbers[0]
              .phoneNumber.vipCategory?.name === 'Regular' && (
              <View style={{ marginHorizontal: 15 }}>
                {ListItem.map((item, index) => {
                  return (
                    <View
                      key={index}
                      style={{
                        borderWidth: 1,
                        borderColor: '#C2C6CE',
                        borderRadius: 12,
                        marginVertical: 5,
                      }}
                      {...setTestID(`${testIds.BauNuberPrepaidV2View5}_${index}`)}
                    >
                      <DuListItemStandard
                        {...setTestID(
                          `${testIds.BauNuberPrepaidV2DuListItemStandard}_${index}`
                        )}
                        //@ts-ignore
                        listitemtestID={'DL_TEST' + index}
                        title={item.title}
                        titleProps={{
                          style: {
                            fontSize: 18,
                            fontFamily: 'Inter-Bold',
                          },
                        }}
                        subTitle={item.subTitle}
                        subTitleProps={{
                          style: {
                            fontFamily: 'Moderat-Regular',
                            fontSize: 14,
                            lineHeight: 20,
                          },
                        }}
                        showChevron
                        bottomDivider={false}
                        onPress={() => {
                          setRenderID(renderID + 1);
                          setSelectedIndex(0);
                          item.key === 1 && setExistingSheetOpen(true);
                          item.key === 2 && setSheetOpen(true);
                          // item.key === 2 && setISUpgradeModal(true);
                        }}
                      />
                    </View>
                  );
                })}
              </View>
              )}
        </ScrollView>
  
        <Text
          style={{ fontSize: 14, color: '#3B4559', alignSelf: 'center' }}
          {...setTestID(`${testIds.BauNuberPrepaidV2Text4}_`)}
        >
          {env?.customer_new_number_will_common_text}{' '}
          <Text
            style={{
              fontSize: 14,
              color: '#27143F',
              fontFamily: 'Inter-Bold',
            }}
          >
            {phoneNumbers?.phoneNumber?.phoneNumber}
          </Text>
        </Text>
        <DuButton
          {...setTestID(testIds?.BAUNumberPrepaidDuButton3)}
          title={
            isFromCheckOut
              ? env?.select_this_number_text
              : env?.proceed_to_cart_text
          }
          type="primary"
          containerStyle={{ margin: 8 }}
          onPress={proceedToCart}
          disabled={
            numberExpiredState.expiredState === NumberExpiredStates.EXPIRED ||
            !phoneNumbersPayload
          }
        />
  
        <BottomSheet
          {...setTestID(`${testIds.BauNuberPrepaidV2BottomSheet}_`)}
          isOpen={isSheetOpen}
          topBarVisible={true}
          sheetheight={470}
          onDrawerStateChange={(nextState: any) => {
            setSheetOpen(nextState === 0 ? false : true);
          }}
        >
          <ScrollView {...setTestID(`${testIds.BauNuberPrepaidV2crollView}_`)}>
            <TouchableWithoutFeedback
              onPress={Keyboard.dismiss}
              {...setTestID(
                `${testIds.BauNuberPrepaidV2ouchableWithoutFeedback}_`
              )}
            >
              <View
                style={{
                  backgroundColor: 'white',
                  borderTopLeftRadius: 18,
                  borderTopRightRadius: 18,
                }}
                {...setTestID(`${testIds.BauNuberPrepaidV2View6}_`)}
              >
                <View
                  style={{
                    justifyContent: 'flex-end',
                    flexDirection: 'row',
                    marginTop: 8,
                    paddingHorizontal: 16,
                    marginBottom: 12,
                  }}
                  {...setTestID(`${testIds.BauNuberPrepaidV2View7}_`)}
                >
                  <TouchableOpacity
                    {...setTestID(
                      `${
                        testIds.BauNuberPrepaidV2ChooseNumberText
                      }_${'2touchable'}`
                    )}
                    onPress={() => setSheetOpen(false)}
                  >
                    <DuIcon
                      {...setTestID(testIds?.BAUNumberPrepaidDuIcon)}
                      iconName="cancel"
                      iconColor="#B9BDC6"
                    />
                  </TouchableOpacity>
                </View>
  
                <View
                  style={{
                    marginTop: 8,
                    paddingHorizontal: 16,
                  }}
                  {...setTestID(`${testIds.BauNuberPrepaidV2View8}_`)}
                >
                  <Text
                    style={{
                      fontSize: 22,
                      color: '#181C24',
                      fontFamily: 'Inter-Bold',
                      marginBottom: 15,
                      letterSpacing: -0.3,
                    }}
                    {...setTestID(
                      `${testIds.BauNuberPrepaidV2UpdargetPostpaidText}_`
                    )}
                  >
                    {env?.upgrade_to_postpaid_common_text}
                  </Text>
                  {!isValidPrepaidNumber ? (
                    <View>
                      <View style={{ marginTop: 8 }}>
                        <Text
                          style={{ fontSize: 14, color: '#181C24' }}
                          {...setTestID(
                            `${testIds.BauNuberPrepaidV2EnterYourPrepaid}_`
                          )}
                        >
                          {env?.bau_number_enter_prepaid_title}
                        </Text>
                      </View>
                      <DuTextInput
                        showClearButton={data.isClear}
                        showWarning={data.isError}
                        error={data.isError}
                        errorMessage={
                          data.isError &&
                          (`${env?.not_valid_error_common_text}` as any)
                        }
                        errorMessageStyle={{
                          color: '#E4002B',
                          fontFamily: 'Inter-Medium',
                          fontSize: 13,
                        }}
                        value={formatedText}
                        keyboardType="number-pad"
                        maxLength={data.maxLength}
                        onChangeText={(text) => {
                          upgradeToPrepaidHandler(text);
                        }}
                        {...setTestID(testIds?.BAUNumberPrepaidDuTestInput)}
                      />
  
                      <View style={{ marginTop: 18 }}>
                        <DuButton
                          {...setTestID(testIds?.BAUNumberPrepaidDuButton4)}
                          testID="DB_TEST_II"
                          type="primary"
                          title={env?.confirm_common_text}
                          buttonStyle={{ marginBottom: 10 }}
                          onPress={() => {
                            checkPortInScenario();
                          }}
                          disabled={data.isError}
                        />
                      </View>
                    </View>
                  ) : (
                    <View>
                      <View style={{ bottom: 10 }}>
                        <DuBanner
                          {...setTestID(testIds?.SimScanScreenDuBanner1)}
                          //@ts-ignore
                          buttontitle="sdf"
                          iconPosition="top"
                          verticalPosition="center"
                          icon={{
                            iconName: 'info',
                            iconColor: '#97001D',
                            artWorkHeight: 33,
                            artWorkWidth: 33,
                          }}
                          multipleBoldDescription={[
                            {
                              text: `${env?.common_looks_like_text}`,
                              bold: false,
                            },
                            {
                              text: phoneNumbers?.phoneNumber?.phoneNumber,
                              bold: true,
                            },
                            {
                              text: `${env?.already_poidpaid_number_try_another_common_text}`,
                              bold: false,
                            },
                          ]}
                          multipleWordBoldInDescription={true}
                          type="danger"
                          onPress={
                            /* istanbul ignore next */
                            () => {
                              setIsValidPrepaidNumber(true);
                            }
                          }
                        />
                      </View>
                      <View style={{ marginTop: 1 }}>
                        <DuButton
                          {...setTestID(testIds?.BAUNumberPrepaidDuButton4)}
                          testID="DB_TEST_III"
                          type={'secondary'}
                          title={`${env?.try_again_with_another_number_common_text}`}
                          buttonStyle={{ marginBottom: 12 }}
                          onPress={() => {
                            setIsValidPrepaidNumber(false);
                          }}
                          disabled={data.isError}
                        />
                      </View>
                    </View>
                  )}
                  <View style={{ marginTop: 8 }} />
                </View>
              </View>
            </TouchableWithoutFeedback>
          </ScrollView>
        </BottomSheet>
  
        <BottomSheet
          {...setTestID(`${testIds.BauNuberPrepaidV2BottomSheet1}_`)}
          isOpen={isExistingSheetOpen!}
          topBarVisible={true}
          sheetheight={localizationData?.keepExistingBottomSheetVisibleBoolean? 470 : selectedIndex === 0 ? 620 : 850}
          onDrawerStateChange={(nextState: any) => {
            setExistingSheetOpen(nextState === 0 ? false : true);
          }}
        >
          <KeepExistingSimSheet
            deleteOrderItem={deleteExisingOrder}
            {...setTestID(`${testIds.BauNuberPrepaidV2KeepExistingSimSheet}_`)}
            key={renderID}
            selectedIndex={(index: number) => {
              setSelectedIndex(index);
            }}
            closeButtonClicked={() => {
              /* istanbul ignore next */
              onEventPress({type:'button',typeName:'close – keep existing number'})
              setExistingSheetOpen(false);
            }}
            navigateToShipping={() => {
              /* istanbul ignore next */
              console.log('navigateToShipping');
              UpdateOrderItem();
              setExistingSheetOpen(false);
              // navigateToShipping && navigateToShipping();
            }}
            navigateToCartHandler={async (
              state,
              msisdn,
              isTOSChecked,
              _isESIMClicked,
              _productOfferingId
            ) => {
              callNavigateHandleFun(state, msisdn, isTOSChecked);
  
              // navigateToCart && navigateToCart();
            }}
            addExistingOrder={addExistingOrder}
          />
        </BottomSheet>
  
        <OTPComponentSheet
          {...setTestID(`${testIds.BauNuberPrepaidV2OTPComponentSheet}_`)}
          isVisible={isOTPComponentsOpen}
          // isVisible={true}
          closeButtonClicked={() => {
            setOTPComponentsOpen(false);
          }}
          navigateToCart={async (completeOTP: string) => {
            setPortInSuccessVisible(true);
            setOTPComponentsOpen(false);
            const responseValidateOTP = await validateOtp(
              otpReferenceId,
              completeOTP
            );
            if (responseValidateOTP) {
              let orderUnderItem = await addOrderItemUnderParent(
                getSalesOrder()!.orderItemId || '',
                getSalesOrder().productOffering?.numberOfferingId!,
                phoneNumbersPayload?.data.selectPhoneNumbers.phoneNumbers[0]
                  .phoneNumber.id!,
                characteristics_name,
                'Etisalat',
                'Carrier'
              );
  
              orderUnderItem === undefined
                ? setPortInErrorVisible(true)
                : navigateToCart && navigateToCart();
            }
          }}
          mobileNumber={formatedText}
          startingTime={otpExpireTime}
          resendOTPClicked={async () => {
            await resendOtp(otpReferenceId);
          }}
          navigateToAnotherNumber={() => {
            setOTPComponentsOpen(false);
            setExistingSheetOpen(true);
            logRemoveFromCart();
          }}
        />
  
        <AlertComponent
          {...setTestID(`${testIds.BauNuberPrepaidV2AlertComponent}_`)}
          isVisible={isVisibleAlert}
          phoneNumber={formatedText}
          // status={status}
          onPressChooseDifferentNumber={() => {
            setIsVisibleAlert(false);
          }}
        />
  
        <PortInSuccessComponent
          {...setTestID(`${testIds.BauNuberPrepaidV2PortInSuccessComponent}_`)}
          isVisible={portInSuccessVisible}
          onPressLearnMore={() => {}}
          onPressOk={() => {
            setPortInSuccessVisible(false);
          }}
        />
  
        <PortinErrorComponent
          {...setTestID(
            `${testIds.BauNuberPrepaidV2ChooseNumberText}_${'3portinError'}`
          )}
          isVisible={portInErrorVisible}
          mobileNumber={formatedText}
          startingTime={''}
          closeButtonClicked={function (): void {
            setPortInErrorVisible(false);
            navigateToShipping && navigateToShipping(false, false);
          }}
          navigateToAnotherNumber={function (): void {
            setPortInErrorVisible(false);
            setExistingSheetOpen(true);
          }}
        />
  
        <EsimInfo
          {...setTestID(`${testIds.BauNuberPrepaidV2EsimInfo}_`)}
          isVisible={isEsimInfoVisible}
          closeButtonClicked={() => {
            /* istanbul ignore next */
            setEsimInfoVisible(false);
            setLearnmoreContent(false);
          }}
          isLearnMoreContent={isLearnMoreContent}
          isLearnMoreContentClicked={() => {
            // setLearnmoreContent(true);
            // setEsimInfoVisible(false);
            // onClickLearnmore && onClickLearnmore();
          }}
        />
        <DuOverlay
          {...setTestID(testIds?.BAUNumberPrepaidDuOverlay1)}
          overlayStyle={{ marginHorizontal: 16, borderRadius: 12 }}
          backdropStyle={{ backgroundColor: '#041333', opacity: 0.8 }}
          isVisible={noAvailableNumbersAlertVisibility}
          onBackdropPress={() => setNoAvailableNumbersAlertVisibility(false)}
        >
          <DuDialog
            {...setTestID(testIds?.BAUNumberPrepaidDuDialog1)}
            icon={{
              iconName: 'info',
              iconColor: '#F5C311',
              artWorkWidth: 30,
              artWorkHeight: 30,
            }}
            headline={env?.no_new_numbers_common_text}
            body={env?.new_number_not_available_text}
            primaryText={env?.common_ok_text}
            pressedPrimary={() => setNoAvailableNumbersAlertVisibility(false)}
          />
        </DuOverlay>
  
        <DuOverlay
          {...setTestID(testIds?.BAUNumberPrepaidDuOverlay2)}
          isVisible={overlayVisibility}
          overlayStyle={{
            paddingHorizontal: 16,
            backgroundColor: 'transparent',
            elevation: 0,
          }}
          onBackdropPress={() => {
            setOverlayVisibility(false);
          }}
        >
          <DuDialog
            {...setTestID(testIds?.BAUNumberPrepaidDuDialog2)}
            headline={''}
            body={error?.message}
            primaryText={env?.common_ok_text}
            icon={{
              artWorkWidth: 29,
              artWorkHeight: 26,
              iconName: 'warning',
              iconColor: '#F5C311',
            }}
            pressedPrimary={() => {
              setOverlayVisibility(false);
            }}
          />
        </DuOverlay>
      </View>
    );
  };
  
  // const styles = StyleSheet.create({
  //   modalMainView: {
  //     flex: 1,
  //     backgroundColor: 'white',
  //     borderRadius: 12,
  //     paddingTop: 4,
  //     marginHorizontal: 120,
  //     height: '100%',
  //   },
  //   dockedButton: {
  //     width: '100%',
  //   },
  //   scrollViewConntainerStyle: { flexGrow: 1 },
  //   verifyAndContinueButtonContainer: {
  //     paddingHorizontal: 28,
  //     paddingVertical: 32,
  //     width: '100%',
  //     height: '100%',
  //     flex: 1,
  //     flexGrow: 1,
  //     justifyContent: 'flex-end',
  //   },
  // });
  
  export default BAUNumberPrepaid;
  