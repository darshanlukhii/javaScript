import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  DuButton,
  DuButtonsDock,
  DuHeader,
  DuHeaderProps,
  DuIcon,
  DuJumbotron,
  DuSwitch,
  DuListItemStandard,
  DuListItemStandardProps,
  DuBanner,
} from '@du-greenfield/du-ui-toolkit';
import React, { FC, useState, useEffect, useCallback, useRef } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { DealerNavigatorParamList } from '../../../navigator';
import testIds, { setTestID } from '../../../assets/support/testIds';
import ESIMInfoModal from './ESIMInfoModal';
import {
  bssGetSalesOrder,
  // addExistingOrderItem,
  // createAnonymousSalesOrder,
  // getBssListProductOfferings,
  selectPhoneNumbers,
  updateOrderItems,
} from '../../../utils';
import { getSalesOrder, microappId } from '../../../';
import { getMicroAppContext } from '../../../';
import PortinVirgin from './Sections/PortinVirgin';
import UpgradeVirgin from './Sections/UpgradeVirgin';
import {
  DuAnalyticsPlugin,
  DuAnalyticsTagBuilder,
} from '@du-greenfield/du-analytics-plugin-core';
import DuAnalyticsFirebasePlugin from '@du-greenfield/du-firebase-analytics';
import {
  Actions,
  // AnonymousSalesO8rderInput,
  // PhoneNumbers,
  SelectPhoneNumberInput,
  SelectPhoneNumbers,
} from '../../../utils/gql/models';
import screen from '../../../api/services/Order';
import { RootStateOrAny, useDispatch, useSelector } from 'react-redux';
import FirestoreData from '../../../utils/rest/FirestoreData';
// import { saveAsyncStorage } from '@du-greenfield/du-env-abstraction-plugin';
import { getBssListChildProductOfferings } from '../../Customer/YourAssignedNumber/YourAssignedNumberControls';
import { phoneNumberSelected } from '../../../redux/features/phoneNumbersSlice';
import type { OrderScreenDynamics } from '../../../api/models';
import NoNumberModal from './NoNumberModal copy';
import NumberReservedModal from './NumberReservedModal';
import { useEnvironmentAbstract } from '@du-greenfield/du-abstract-environment-plugin'
export type DealerChooseYourNumberProps = NativeStackScreenProps<
  DealerNavigatorParamList,
  'ChooseYourNumberScreen'
> & {
  proceedToCartNext?: () => any;
  browseMoreNumbers?: () => any;
  onPressUseDifferentEmiratesId: () => void;
  onRefreshSessionClicked?: () => void;
  onEndSessionClicked?: () => void;
  onCartClicked?: () => void;
  refreshSessionShow?: boolean;
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

export type TextWithSufixIconProps = {
  text: string;
  icon: string;
};

/* istanbul ignore next */
const DealerChooseYourNumber: FC<DealerChooseYourNumberProps> = ({
  navigation,
  proceedToCartNext,
  browseMoreNumbers,
  onPressUseDifferentEmiratesId,
  onRefreshSessionClicked,
  onEndSessionClicked,
  onCartClicked,
  refreshSessionShow,
}) => {
  const dispatch = useDispatch();
  const safeAreaInsets = useSafeAreaInsets();
  const [esimInfoModalVisibility, setEsimInfoModalVisibility] = useState(false);
  const [numberExpiredState, setNumberExpiredState] =
    useState<NumberExpiredState>({
      expiredState: NumberExpiredStates.NOTEXPIRED,
    });
  const [isNewNumber, setIsNewNumber] = useState(false);
  const [isNumberResreved, setIsNumberResreved] = useState(false);
  const [selectedRandomId, setSelectedRandomId] = useState<number>(0);
  const [remainingSecondsToExpire, setRemainingSecondsToExpire] =
    useState<number>(36000);
  const [, /*phoneNumberLocked*/ setPhoneNumberLocked] =
    useState<boolean>(false);
  const [isFirstTimeLockPhoneNumber, setIsFirstTimeLockPhoneNumber] =
    useState<boolean>(false);

  // const [esimCompatible, setEsimCompatible] = useState<boolean>(false);
  const [esimChosen, setEsimChosen] = useState<boolean>(true);
  const [disableProceedToCart, setProceedToCartToDisabled] = useState(false);
  const [portVisible, setPortVisible] = useState<boolean>(false);
  const [upgradeVisible, setUpgradeVisible] = useState<boolean>(false);
  const [, setOrderScreenDynamics] = useState<OrderScreenDynamics | undefined>(
    undefined
  );
  const [, setOfferingID] = useState<string>('');
  const [maskedViewPhoneNumber, setMaskedViewPhoneNumber] = useState('');
  const [, setNoAvailableNumbersAlertVisibility] = useState<boolean>(false);
  // const [isFromCheckOut] = useState<boolean | undefined>(false);
  const [_, setcharacteristics_name] = useState<string>('');
  // let idArray: Array<string> = [];

  const intervalRef = useRef<NodeJS.Timer | null>(null);

  const [, /*phoneNumbersPayload*/ setPhoneNumbersPayload] = useState<
    SelectPhoneNumbers | undefined
  >(undefined);
  const [isGoldTier /*setIsGoldTier*/] = useState(false);

  const phoneNumbers = useSelector(
    (state: RootStateOrAny) => state.phoneNumberSlice
  );
  const env = useEnvironmentAbstract(
    [microappId],
    getMicroAppContext()?.appLanguage!,
    getMicroAppContext()?.appType
  );

  useEffect(() => {
    if (phoneNumbers?.phoneNumbers?.length > 0) {
      setIsNewNumber(true);
    }
  }, []);

  const interactiveIconsCount = () => {
    const icon2 = {
      icon: { iconName: 'cart1', iconSize: 20, iconColor: '#753BBD' },
      pressed: () => {
        onCartClicked && onCartClicked();
      },
    };
    const icon1 = {
      icon: { iconName: 'power-setting', iconSize: 20, iconColor: '#753BBD' },
      pressed: () => {
        onEndSessionClicked && onEndSessionClicked();
      },
    };
    return [icon1, icon2];
  };

  const interactiveIconsRefresh = () => {
    const icon2 = {
      icon: { iconName: 'cart1', iconSize: 20, iconColor: '#753BBD' },
      pressed: () => onCartClicked && onCartClicked(),
    };
    const icon1 = {
      icon: { iconName: 'refresh', iconSize: 24, iconColor: '#753BBD' },
      pressed: () => {
        onRefreshSessionClicked && onRefreshSessionClicked();
      },
    };
    return [icon1, icon2];
  };

  /* istanbul ignore next */
  const listItems: DuListItemStandardProps[] = [
    {
      key: 1,
      title: env?.kepp_existing_number_common_text,
      subTitle: env?.existing_vergin_or_etisalat_common_text,
    },
    {
      key: 2,
      title: env?.upgrade_to_postpaid_common_text,
      subTitle:env?.choose_your_change_postpaid_subtile,
    },
  ];
  /* istanbul ignore next */
  const context = getMicroAppContext();
  const [headerProps, _useHeaderProps] = useState<DuHeaderProps>({
    left: 'back',
    leftPressed: () => {
      /* istanbul ignore next */
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
    },
    //@ts-ignore
    isDealerHeader: true,
    interactiveIcons: interactiveIconsCount(),
    statusBar: { barStyle: 'dark-content', backgroundColor: 'white' },
    background: 'white',
    right: 'interactive',
    cart: {
      count: 2,
      pressed: () => {
        onCartClicked && onCartClicked();
      },
    },
    customerName: `${context.customer?.firstName} ${context.customer?.lastName}`,
    hideVerticalDivider: true,
  });

  useEffect(() => {
    if (refreshSessionShow) {
      //@ts-ignore
      headerProps.customerName = 'Guest';
      headerProps.interactiveIcons = interactiveIconsRefresh();
    }
  }, []);

  const grayInfoIcon = {
    iconName: 'info',
    iconColor: '#677084',
  };
  // ===========================================================
  /* istanbul ignore next */
  // const callForInitialInfo = async () => {
  //   const response1 = await getBssListProductOfferings();
  //   if (response1) {
  //     getSalesOrder().productOffering!.id = response1.bssListProductOfferings[0].id;

  //     let requestInput2: AnonymousSalesOrderInput = {
  //       customerType: 'Residential',
  //       addressUnitId: '9164324021713510114'
  //     };
  //     const response2 = await createAnonymousSalesOrder(requestInput2);

  //     if (response2) {
  //       getSalesOrder().salesOrderId = response2.createAnonymousSalesOrder.salesOrder.salesOrderId;
  //       getSalesOrder().customer.id = response2.createAnonymousSalesOrder.salesOrder.customerId;
  //       getSalesOrder().customer.customerLocations[0].id = response2.createAnonymousSalesOrder.salesOrder.locationIds[0];
  //       const response4 = await addExistingOrderItem(
  //         getSalesOrder().salesOrderId,
  //         getSalesOrder().customer.customerLocations[0].id,
  //         "2022666396"
  //       )
  //       if (response4) {
  //         getSalesOrder().orderItemId = response4.addExistingOrderItem.salesOrder.orderItems[0].orderItemId;
  //         fetchData();

  //       }

  //       // ===========================================================
  //       /* istanbul ignore next */
  //       const callForInitialInfo = async () => {
  //         const response1 = await getBssListProductOfferings();
  //         if (response1) {
  //           getSalesOrder().productOffering!.id = response1.bssListProductOfferings[0].id;
  //           let requestInput2: AnonymousSalesOrderInput = {
  //             customerType: 'Residential',
  //             addressUnitId: '9164324021713510114'
  //           };
  //           const response2 = await createAnonymousSalesOrder(requestInput2);
  //           if (response2) {
  //             getSalesOrder().salesOrderId = response2.createAnonymousSalesOrder.salesOrder.salesOrderId;
  //             getSalesOrder().customer.id = response2.createAnonymousSalesOrder.salesOrder.customerId;
  //             getSalesOrder().customer.customerLocations[0].id = response2.createAnonymousSalesOrder.salesOrder.locationIds[0];
  //             const response4 = await addExistingOrderItem(
  //               getSalesOrder().salesOrderId,
  //               getSalesOrder().customer.customerLocations[0].id,
  //               "2022666396"
  //             )
  //             if (response4) {
  //               getSalesOrder().orderItemId = response4.addExistingOrderItem.salesOrder.orderItems[0].orderItemId;
  //               fetchData();

  //             }
  //           }
  //         }
  //       }

  //       useEffect(() => {
  //         callForInitialInfo();
  //       }, [])
  //     }
  //   }
  // }

  // useEffect(() => {
  //   callForInitialInfo();
  // }, [])

  useEffect(() => { }, []);

  useEffect(() => {
    const fn = async () => {
      try {
        console.log('useEffect');
        await getData();
        console.log('useEffect2');
        await fetchData();
        console.log('useEffect3');
      } catch (e) {
        console.error(e);
      }
    };

    fn();
    // getIdArray();
    // setIsFromChekout(getMicroAppContext().flags?.fromChekout);

    // setEmSimSwitchCheck(true);
  }, []);

  // const getIdArray =
  // eslint-disable-next-line react-hooks/exhaustive-deps async () => {
  //   // await getBssListChildProductOfferings().then((res: any) => {
  //   //   for (var i = 0; i < res.bssListChildProductOfferings.length; i++) {
  //   //     idArray.push(res[i]);
  //   //   }
  //   //   saveAsyncStorage('vip-id-array', idArray);
  //   // });
  // };

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

  const [oldPhoneNumberId, setOldPhoneNumberId] = useState<any>('');
  const [orderItemIdPhone, setOrderItemIdPhone] = useState<any>('');

  async function selectRandomPhoneNumber(
    action: Actions,
    qty: number,
    offID?: string
    // oldPhoneNumbers?: PhoneNumbers
  ) {
    let requestInput: SelectPhoneNumberInput = {
      action: action,
      quantity: action != Actions.SHUFFLE ? qty : undefined,
      salesOrderId: getSalesOrder().salesOrderId,
      customerId: getSalesOrder().customer.id,
      productOfferingId: offID,
      parentOrderItemId: getSalesOrder().orderItemId!,
      phoneNumbers:
        action == Actions.SHUFFLE
          ? {
            oldPhoneNumberId: oldPhoneNumberId,
            orderItemId: orderItemIdPhone,
          }
          : undefined,
    };

    const response = await selectPhoneNumbers(requestInput);
    console.log('RANDOM RESPONSE::::', response);
    if (response) {
      setOldPhoneNumberId(
        response.data.selectPhoneNumbers.phoneNumbers[0].phoneNumber.id!
      );
      setOrderItemIdPhone(
        response?.data.selectPhoneNumbers?.phoneNumbers[0]?.orderItemId!
      );
      if (
        response.data.selectPhoneNumbers.phoneNumbers.length <= 0 &&
        !isFirstTimeLockPhoneNumber
      ) {
        //cannot trigger at the first attempt
        setNoAvailableNumbersAlertVisibility(true);
        return;
      }
      setPhoneNumbersPayload(response);
      let tempPhoneNumber =
        response?.data.selectPhoneNumbers?.phoneNumbers?.[0]?.phoneNumber
          ?.phoneNumber;
      const trimmedNumber = tempPhoneNumber?.split('').slice(3).join('');
      let tempMaskedView = trimmedNumber!
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d{3})(\d{4})/, '$1 $2 $3');
      setMaskedViewPhoneNumber(tempMaskedView);
      generatePhoneNumbers(response.data.selectPhoneNumbers);
      getSalesOrder().msisdn!.msisdnId =
        response.data.selectPhoneNumbers.phoneNumbers[0].phoneNumber.phoneNumber;
      getSalesOrder().msisdn!.reservationDate =
        response.data.selectPhoneNumbers.phoneNumbers[0].phoneNumber.reservationDate;
      let reservationDate =
        response.data.selectPhoneNumbers.phoneNumbers[0].phoneNumber
          .reservationDate;
      setRemainingSecondsToExpire(
        new Date(reservationDate!).getTime() +
        12 * 60 * 60 * 1000 -
        new Date().getTime()
      );
      for (let phoneNumberObject of response.data.selectPhoneNumbers
        .phoneNumbers) {
        if (phoneNumberObject.phoneNumber.status === 'LOCKED' || 'RESERVED') {
          setPhoneNumberLocked(true);
        }
      }
      setIsFirstTimeLockPhoneNumber(false);
    }
  }

  const onNumberExpired = () => {
    let analytics: DuAnalyticsPlugin = new DuAnalyticsFirebasePlugin();
    let tagBuilder = new DuAnalyticsTagBuilder();
    let params = tagBuilder
      .journeyName('postpaid + device - dealer app')
      .subJourneyName(`postpaid + device : new number`)
      .screenName('DIP - device details')
      .errorName('number expiredt')
      .errorType('danger')
      .errorMessage('This number has expired. Don’t worry, you can find a new one and proceed.')
      .build()
    analytics.logEvent('error_occured', params);
  }

  useEffect(() => {
    if (remainingSecondsToExpire == 0) {
      onNumberExpired()
      setNumberExpiredState({ expiredState: NumberExpiredStates.EXPIRED });
      setPhoneNumberLocked(false);
      return;
    } else {
      let remaingTimeInHours = Math.floor(remainingSecondsToExpire / 3600);
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

  const getData = async () => {
    const response = await FirestoreData.getVariables();
    setcharacteristics_name(
      response.data.documents[0].fields[
        'input.productOffering.characteristics.name'
      ].stringValue
    );
  };

  async function fetchData() {
    setPhoneNumbersPayload(undefined);
    setOrderScreenDynamics(await screen.getScreenDynamics());
    const response: any = await getBssListChildProductOfferings();
    if (!response) {
      throw new Error('No response from getBssListChildProductOfferings');
    }
    console.log('response bssListChildProductOffering', response);

    setOfferingID(response.bssListProductOfferings[0].id);
    await selectRandomPhoneNumber(
      Actions.RANDOM,
      1,
      response.bssListProductOfferings[0].id ?? ''
    );
  }

  const analyticLogScreenView = useCallback(() => {
    let analytics: DuAnalyticsPlugin = new DuAnalyticsFirebasePlugin();
    let tagBuilder = new DuAnalyticsTagBuilder();
    let params = tagBuilder
      .pageName('Assign random number')
      .journeyName('GF Explore')
      .pageChannel('Customer App')
      .previousScreenName('Lines section')
      .screenType('pdp')
      .screenHierarchy('Homepage: pdp: Family plan: Assign random number')
      .screenBreadcrumb('Family plan: Assign random number')
      .customerType('new')
      .visitorStatus('returning')
      .recency('5d')
      .customerLoginStatus('logged in')
      .customerEligibility('GF eligible')
      .customerSegment('consumer')
      .productTargetSegment('Prospect')
      .build();
    analytics.logScreenView('GF explore', 'Assign random number', params);
  }, []);

  useEffect(() => {
    analyticLogScreenView();
  }, [analyticLogScreenView]);

  // const analyticLogPressEligibilityCheck = () => {
  //   let analytics: DuAnalyticsPlugin = new DuAnalyticsFirebasePlugin();
  //   analytics.logEvent('Continue_To_Eligibility_Check_Button_Click', {
  //     event_category: 'Continue to eligibility check button',
  //     event_label: 'Continue to eligibility check',
  //     event_name: 'Assigned a number: Continue to eligibility check',
  //     event_action: 'Continue to eligibility check button Click',
  //   });
  // };

  const analyticLogPressBrowseNumbers = () => {
    let analytics: DuAnalyticsPlugin = new DuAnalyticsFirebasePlugin();
    analytics.logEvent('Browse_More_Numbers_Button_Click', {
      event_category: 'Browse more numbers button',
      event_label: 'Browse more numbers',
      event_name: 'Assigned a number: Browse more numbers',
      event_action: 'Browse more numbers button Click',
    });
  };

  const logAddToCart = () => {
    let tagBuilder = new DuAnalyticsTagBuilder();

    let item = tagBuilder
      .itemId(getSalesOrder().product.id.toLowerCase())
      .itemName(getSalesOrder().product.name.toLowerCase())
      .itemBrand('du')
      .itemCategory3(esimChosen ? 'e-sim' : "p-sim")
      .itemCategory4(`${getSalesOrder().product.plan.data} gb`)
      .itemCategory5(`${getSalesOrder().product.plan.duration} months`)
      .price(getSalesOrder().product.plan.price.amount)
      .quantity(1)
      .build()

    let params = {
      journey_name: 'postpaid - dealer app',
      sub_journey_name: `postpaid only : ${phoneNumbers?.phoneNumber?.phoneNumber}`,
      currency: 'aed',
      value: getSalesOrder().product.plan.price.amount,
      items: [item]
    }
    
    let analytics: DuAnalyticsPlugin = new DuAnalyticsFirebasePlugin();
    analytics.logEvent('add_to_cart', params);
  }

  const onEventPress = ({type,typeName}:{type:string,typeName:string})=>{
    let tagBuilder = new DuAnalyticsTagBuilder();
    let params = tagBuilder
      .journeyName('postpaid - dealer app')
      .subJourneyName(`postpaid only : ${phoneNumbers?.phoneNumber?.phoneNumber}`)
      .pageType('choose number page')
      .clickCtaName(typeName)
      .clickCtaType(type)
      .planId(getSalesOrder().product.id.toLowerCase())
      .planName(getSalesOrder().product.name.toLowerCase())
      .build()
    let analytics: DuAnalyticsPlugin = new DuAnalyticsFirebasePlugin();
    analytics.logEvent('click_cta', params);
  }
  /* istanbul ignore next */
  const proceedToCart = async () => {
    setProceedToCartToDisabled(true);
    // API call to update to ESIM
    try {
      let salesOrder = getSalesOrder();

      if (esimChosen) {
        if (!salesOrder.orderItemId) {
          throw new Error('Sales order does not exist.');
        }

        console.log('dfsafsa');
        let order = await bssGetSalesOrder(salesOrder.salesOrderId, false);

        if (!order) {
          throw new Error("bssGetSalesOrder failed.");
        }

        console.log(order, 'dfafdassdfasf');
        const plan = order.orderItems.find(
          (i) =>
            Object.keys(i.chars).some((i) => i === 'Plan type') &&
            i.chars['Plan type'] === 'Postpaid'
        );

        console.log(plan, 'orderdfasfdfsdfafdafa');

        const item = plan.orderItems.find(
          (i) =>
            Object.keys(i.chars).some((i) => i === 'Equipment type') &&
            i.chars['Equipment type'] === 'SIM card'
        );

        let response = await updateOrderItems(salesOrder.salesOrderId, item.id);
        // Navigate to next screen
        proceedToCartNext && proceedToCartNext();
        logAddToCart();

        if (!response) {
          throw new Error('updateOrderItem for eSIM failed.');
        }
      }
    } catch (e) {
      /* istanbul ignore next */
      console.error(e);
    }

    setProceedToCartToDisabled(false);
  };

  const shuffle = async () => {
    onEventPress({type:'button',typeName:'click – shuffle'})
    await selectRandomPhoneNumber(Actions.SHUFFLE, 1);
  };

  /* istanbul ignore next */
  // const bssListProductOfferingsApiCall = async () => {
  //   try {
  //     setUpgradeVisible(true);
  //     const response = await getBssListProductOfferings();
  //     if (response.bssListProductOfferings[0].id == '') {
  //       setUpgradeVisible(false);
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  const onListPress = (index: number) => {
    console.log('index', index);

    if (index === 0) {
      setPortVisible(true);
    }
    if (index === 1) {
      // bssListProductOfferingsApiCall();
      setUpgradeVisible(true);
    }
  };
  /* istanbul ignore next */
  return (
    <View style={styles.root}>
      {Platform.OS === 'ios' ? (
        <View style={styles.iosStackHeaderPadding} />
      ) : (
        <View style={{ marginBottom: safeAreaInsets.top }} />
      )}
      <DuHeader
        {...headerProps}
        {...setTestID(testIds?.ChooseYourNumberDuHeader)}
      />
      <ScrollView>
        <View style={styles.subContainer}>
          <View style={{ marginTop: 32 }}>
            <DuJumbotron
              {...setTestID(`${testIds.DealerChooseYourNumberDuJumbotron}_`)}
              size="xxlarge"
              alignment="center"
              mainJumbotron={env?.choose_number_common_text}
            />
          </View>
          <View style={[styles.numberAndButtonContainer]}>
            <View style={{ flex: 1, flexDirection: 'column' }}>
              <View>
                <View
                  style={{
                    width: '90%',
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <DuJumbotron
                    {...setTestID(
                      `${testIds.DealerChooseYourNumberDuJumbotron2}_`
                    )}
                    //@ts-ignore
                    mainTextFontWeight={'700'}
                    mainJumbotron={env?.choose_your_jumbotron_new_number_text}
                    mainTextSize={18}
                  // disabled = {NumberExpiredStates.EXPIRED? true: false}
                  />
                  {isGoldTier && (
                    <Image
                      source={require('../../../assets/img/Tier.png')}
                      style={{ width: 68, height: 20 }}
                      resizeMode="contain"
                      {...setTestID(`${testIds.DealerChooseYourNumberImage}_`)}
                    />
                  )}
                </View>

                <View style={{ marginVertical: 5 }}>
                  <DuJumbotron
                    {...setTestID(testIds?.BAUNumberPrepaidDuJumbotron2)}
                    mainJumbotron={maskedViewPhoneNumber}
                    // mainJumbotron={phoneNumbersPayload?.selectPhoneNumbers?.phoneNumbers?.[0]?.phoneNumber?.phoneNumber}
                    //@ts-ignore
                    mainTextSize={26}
                    disabled={
                      numberExpiredState?.expiredState ===
                        NumberExpiredStates.EXPIRED
                        ? true
                        : false
                    }
                    mainTextFontWeight={'800'}
                  />
                </View>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <DuButton
                  {...setTestID(
                    testIds?.ChooseYourNumberScreenBrowseNumbersBtn
                  )}
                  type="secondary"
                  title={
                    numberExpiredState?.expiredState ===  NumberExpiredStates.EXPIRED? `${env?.choose_your_find_number_text}`: `${env?.browse_numbers_common_text}`
                  }
                  size="small"
                  onPress={() => {
                    /* istanbul ignore next */
                    onEventPress({type:'button',typeName:'click – browse number'})
                    analyticLogPressBrowseNumbers();
                    browseMoreNumbers && browseMoreNumbers();
                    if (
                      numberExpiredState?.expiredState ===
                      NumberExpiredStates.EXPIRED
                    ) {
                      setIsNewNumber(true);
                    } else {
                      navigation.navigate('BrowseMoreNumberScreen');
                    }
                  }}
                />
                <DuButton
                  {...setTestID(testIds?.ChooseYourNumberScreenShuffleBtn)}
                  type="teritary"
                  title={env?.shuffle_common_text}
                  size="small"
                  icon={{ iconName: 'refresh' }}
                  containerStyle={styles.shuffleButton}
                  onPress={shuffle}
                />
              </View>
              <View style={styles.esimContainer}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={StyleSheet.flatten([
                      styles.suffixText,
                      //   { color: !phoneNumberLocked ? '#B9BDC6' : '#737B8D' },
                    ])}
                    {...setTestID(
                      `${testIds.DealerChooseYourNumberProceedText}_`
                    )}
                  >
                    {env?.proceed_with_esim_text}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      /* istanbul ignore next */
                      setEsimInfoModalVisibility(true);
                    }}
                    {...setTestID(
                      `${testIds.DealerChooseYourNumberTouchableOpacity}_}`
                    )}
                  >
                    <DuIcon
                      {...setTestID(`${testIds.DealerChooseYourNumberDuIcon}_`)}
                      {...grayInfoIcon}
                      artWorkHeight={22}
                      artWorkWidth={22}
                    //   iconColor={!phoneNumberLocked ? '#B9BDC6' : '#737B8D'}
                    />
                  </TouchableOpacity>
                </View>
                <DuSwitch
                  {...setTestID(`${testIds.DealerChooseYourNumberDuSwitch}_`)}
                  onValueChange={(value) => {
                    onEventPress({type:'button',typeName:'proceed with esim'})                    
                    setEsimChosen(!value);
                  }}
                  value={esimChosen}
                //   disabled={emSimSwitchDisable || !phoneNumberLocked}
                />
              </View>
              <View style={{ height: 16 }}></View>

              {numberExpiredState.expiredState ===
                NumberExpiredStates.NOTEXPIRED && (
                <TouchableOpacity
                  style={{
                    alignItems: 'center',
                    backgroundColor: '#F6F6F8',
                    flexDirection: 'row',
                    padding: 16,
                    borderRadius: 12,
                  }}
                  onPress={() => {
                    setIsNumberResreved(true);
                  }}
                  {...setTestID(
                    `${testIds.DealerChooseYourNumberouchableOpacity2}_`
                  )}
                >
                  <DuIcon
                    {...grayInfoIcon}
                    {...setTestID(`${testIds.DealerChooseYourNumberDuIcon2}_}`)}
                  />
                  <Text
                    style={{ marginStart: 18 }}
                    {...setTestID(`${testIds.DealerChooseYourNumberText24}_`)}
                  >
                    {env?.choose_your_reserved_24_title}
                  </Text>
                </TouchableOpacity>
              )}
              {numberExpiredState.expiredState ===
                NumberExpiredStates.EXPIRED && (
                <DuBanner
                  {...setTestID(
                    testIds?.DealerYourAssignedNumberScreenDuBanner1
                  )}
                  buttontitle=""
                  icon={{
                    iconName: 'warning',
                    iconColor: '#BA0023',
                    iconSize: 29,
                  }}
                  title={env?.number_expired_find_new_common_text}
                  type="danger"
                />
              )}
              {numberExpiredState.expiredState ===
                NumberExpiredStates.LESSTHANFOURHOURSTOEXPIRE && (
                <DuBanner
                  {...setTestID(
                    testIds?.DealerYourAssignedNumberScreenDuBanner2
                  )}
                  buttontitle=""
                  icon={{
                    iconName: 'info',
                    iconColor: '#C79C02',
                    iconSize: 29,
                  }}
                  title={env?.number_will_expire_soon_checkout_common_text}
                  type="warning"
                />
              )}
            </View>
          </View>
          {!isGoldTier && (
            <View style={{ marginTop: 8 }}>
              {listItems.map((item, index) => {
                /* istanbul ignore next */
                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => onListPress(index)}
                    {...setTestID(
                      `${testIds.DealerChooseYourNumberTouchableOpacity3}_${index ?? '_'
                      }`
                    )}
                  >
                    <View
                      style={{
                        borderWidth: 1,
                        borderColor: '#C2C6CE',
                        borderRadius: 12,
                        marginVertical: 5,
                      }}
                      {...setTestID(
                        `${testIds.DealerChooseYourNumberlistItemiew}_${index ?? '_'
                        }`
                      )}
                    >
                      <DuListItemStandard
                        {...setTestID(
                          `${testIds.DealerChooseYourNumberlistItemuListItemStandard
                          }_${index ?? '_'}`
                        )}
                        title={item.title}
                        titleProps={{
                          style: { fontSize: 18, fontFamily: 'Inter-Bold' },
                        }}
                        subTitle={item.subTitle}
                        showChevron
                        bottomDivider={false}
                      />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      <DuButtonsDock
        {...setTestID(`${testIds.DealerChooseYourNumberDuButtonsDock5}_`)}
        items={[
          <Text
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
           {env?.customer_new_number_will_common_text}{' '}
            <Text
              style={{ fontWeight: '700' }}
              {...setTestID(`${testIds.DealerChooseYourNumberCustomerText}_`)}
            >
              {maskedViewPhoneNumber}
            </Text>
          </Text>,
          <View>
            <DuButton
              title={env?.proceed_to_cart_common_text}
              type="primary"
              onPress={proceedToCart}
              {...setTestID(testIds?.ChooseYourNumberDuButton1)}
              disabled={disableProceedToCart}
            />
          </View>,
        ]}
      />
      <ESIMInfoModal
        {...setTestID(`${testIds.DealerChooseYourNumberSIMInfoModal}_`)}
        isVisible={esimInfoModalVisibility}
        onDismiss={() => {
          setEsimInfoModalVisibility(false);
        }}
      />

      <NoNumberModal
        {...setTestID(`${testIds.DealerChooseYourNumberNoNumberModal}_`)}
        isVisible={isNewNumber}
        onDismiss={() => {
          setIsNewNumber(false);
        }}
      />

      <NumberReservedModal
        {...setTestID(`${testIds.DealerChooseYourNumberNumberReservedModal3}_`)}
        isVisible={isNumberResreved}
        onDismiss={() => {
          setIsNumberResreved(false);
        }}
      />

      <PortinVirgin
        {...setTestID(`${testIds.DealerChooseYourNumberPortinVirgin}_`)}
        isVisible={portVisible}
        onClosepress={() => {
          onEventPress({type:'button',typeName:'close – keep existing number'})
          setPortVisible(false);
        }}
        onProceedToCart={() => {
          logAddToCart();
        }}
        onUseAnotherNumber={() => { }}
        onPressUseDifferentEmiratesId={() =>
          onPressUseDifferentEmiratesId && onPressUseDifferentEmiratesId()
        }
        currentPhoneNumberOrderId={orderItemIdPhone}
      />

      <UpgradeVirgin
        {...setTestID(`${testIds.DealerChooseYourNumberUpgradeVirgin4}_`)}
        isVisible={upgradeVisible}
        onClosepress={() => {
          setUpgradeVisible(false);
        }}
        onProceedToCart={() => { }}
        onUseAnotherNumber={() => { }}
        onPressUseDifferentEmiratesId={() =>
          onPressUseDifferentEmiratesId && onPressUseDifferentEmiratesId()
        }
      />
    </View>
  );
};

export default DealerChooseYourNumber;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'white' },
  subContainer: { flex: 1, backgroundColor: 'white', paddingHorizontal: '20%' },
  iosStackHeaderPadding: { marginBottom: 14 },
  purple: { color: '#753BBD' },
  numberAndButtonContainer: {
    flexDirection: 'row',
    marginTop: 32,
    padding: 16,
    borderColor: '#C2C6CE',
    borderWidth: 1,
    borderRadius: 12,
  },
  shuffleButton: { paddingHorizontal: 0 },
  number: {
    fontFamily: 'Inter-Bold',
    fontSize: 22,
    textAlign: 'left',
    letterSpacing: -0.3,
    paddingTop: 16,
  },
  esimContainer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  simCardIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 48,
    height: 48,
    backgroundColor: '#F5F6F7',
    borderRadius: 24,
  },
  buttonDockContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconContainer: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#F5F6F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  suffixText: {
    fontFamily: 'Inter-Regular',
    fontStyle: 'normal',
    fontSize: 14,
    lineHeight: 20,
    marginRight: 5,
  },
});
