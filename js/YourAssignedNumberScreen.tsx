import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  DuButton,
  DuButtonsDock,
  DuDialog,
  DuHeader,
  DuHeaderProps,
  DuJumbotron,
  DuOverlay,
  DuIcon,
  DuBanner,
  DuSwitch,
  DuSheet,
  // DuSheetProps,
} from '@du-greenfield/du-ui-toolkit';
import { MaskedText } from 'react-native-mask-text';
import React, { FC, useEffect, useRef, useState, useCallback } from 'react';
import {
  DuAnalyticsPlugin,
  DuAnalyticsTagBuilder,
} from '@du-greenfield/du-analytics-plugin-core';
import DuAnalyticsFirebasePlugin from '@du-greenfield/du-firebase-analytics';
import {
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { OrderScreenDynamics } from '../../../api/models';
import screen from '../../../api/services/Order';
import type { CustomerNavigatorParamList } from '../../../navigator';
import {
  // bssListChildProductOfferings,
  selectPhoneNumbers,
} from '../../../utils';
import {
  Actions,
  AddorderitemunderparentInputs,
  PhoneNumbers,
  SelectPhoneNumberInput,
  SelectPhoneNumbers,
} from '../../../utils/gql/models';
import {
  addExistingOrderItemUnderParent,
  getBssListProductOfferings,
} from '../../../utils';
import { RootStateOrAny, useDispatch, useSelector } from 'react-redux';
import { phoneNumberSelected } from '../../../redux/features/phoneNumbersSlice';
import { getMicroAppContext, getSalesOrder, microappId } from '../../../';
import type {
  GraphQLErrorCode,
  Msisdn,
  Order,
} from '@du-greenfield/du-commons';
import FirestoreData from '../../../utils/rest/getFirestoreData';
import type { MicroAppsProps } from '@du-greenfield/du-microapps-core';
// import { getMicroAppContext } from 'lib/typescript';
import testIds, { setTestID } from '../../../assets/support/testIds';
import { useEnvironmentAbstract } from '@du-greenfield/du-abstract-environment-plugin'
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

export type CustomerYourAssignedNumberScreenProps = NativeStackScreenProps<
  CustomerNavigatorParamList,
  'YourAssignedNumberScreen'
> &
  MicroAppsProps & {
    numberSelectionComplete: (order: Order, selectedMsisdn: Msisdn) => void;
    onBrowseMoreTap: () => void;
    redirectToCheckout: (order: Order, selectedMsisdn: Msisdn) => void;
    onLearnMorePress: () => void;
  };

const CustomerYourAssignedNumberScreen: FC<
  CustomerYourAssignedNumberScreenProps
> = ({
  navigation,
  numberSelectionComplete,
  onBrowseMoreTap,
  // rootNavigation,
  redirectToCheckout,
  onLearnMorePress
}) => {
  const [overlayVisibility, setOverlayVisibility] = useState<boolean>(false);
  const [orderScreenDynamics, setOrderScreenDynamics] = useState<
    OrderScreenDynamics | undefined
  >(undefined);
  // const [phoneNumbersPayload, setPhoneNumbersPayload] = useState<
  //   LockPhoneNumber | undefined
  // >(undefined);
  const [phoneNumbersPayload, setPhoneNumbersPayload] = useState<
    SelectPhoneNumbers | undefined
  >(undefined);
  const [phoneNumberLocked, setPhoneNumberLocked] = useState<boolean>(false);
  const [isFirstTimeLockPhoneNumber, setIsFirstTimeLockPhoneNumber] =
    useState<boolean>(true);
  const [remainingSecondsToExpire, setRemainingSecondsToExpire] =
    useState<number>(36000);
  // const [remainingHoursToExpire, setRemainingHoursSecondsToExpire] =
  //   useState<number>(36000);
  const intervalRef = useRef<NodeJS.Timer | null>(null);
  const safeAreaInsets = useSafeAreaInsets();
  const [error] = useState<GraphQLErrorCode>();
  const [numberExpiredState, setNumberExpiredState] =
    useState<NumberExpiredState>({
      expiredState: NumberExpiredStates.NOTEXPIRED,
    });
  const [
    noAvailableNumbersAlertVisibility,
    setNoAvailableNumbersAlertVisibility,
  ] = useState<boolean>(false);
  // const [showSheet, setShowSheet] = useState<boolean>(false);
  const phoneNumbers = useSelector(
    (state: RootStateOrAny) => state.phoneNumberSlice
  );
  // @ts-ignore
  const [emSimSwitchCheck, setEmSimSwitchCheck] = useState(false);
  // const [emSimSwitchDisable] = useState(false);
  const [bssListProductOfferings, setBssListProductOfferingsResponce] =
    useState('');
  const [isFromCheckOut] = useState<boolean | undefined>(false);
  const [_, setcharacteristics_name] = useState<string>('');
  const [selectedRandomId, setSelectedRandomId] = useState<number>(0);
  const [disabledBtn, setDisabledBtn] = useState<boolean>(false);
  const [isESimModal, setIsSimModal] = useState<boolean>(false);
  let idArray: Array<string> = [];
  const env = useEnvironmentAbstract(
    [microappId],
    getMicroAppContext()?.appLanguage!,
    getMicroAppContext()?.appType
  );
  //const { esim } = route.params as unknown as { esim: string };
  // let esim = ''; //FIXME:: esim param should be handled for both example and main apps

    // KEEP ###
    // useEffect(() => {
    //   console.log('esimesim----', esim);
    //   if (esim === 'gotEsim') {
    //     setEmSimSwitchCheck(true);
    //   } else if (esim === 'noEsim') {
    //     setEmSimSwitchCheck(false);
    //   } else {
    //     setEmSimSwitchDisable(true);
    //   }
    // }, [esim]);
    // const remainingSecondsToExpireRef = useRef(0);
    const dispatch = useDispatch();

    useEffect(() => {
      getData();
    }, []);

    useEffect(() => {
      // getIdArray();
      // setIsFromChekout(getMicroAppContext().flags?.fromChekout);
      fetchData();
      // setEmSimSwitchCheck(true);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // const getIdArray = async () => {
    //   await getBssListChildProductOfferings().then((res) => {
    //     for (var i = 0; i < res.length; i++) {
    //       idArray.push(res[i]);
    //     }
    //     saveAsyncStorage('vip-id-array', idArray);
    //   });
    // };

    const getData = async () => {
      const response = await FirestoreData.getVariables();
      setcharacteristics_name(
        response.data.documents[0].fields[
          'input.productOffering.characteristics.name'
        ].stringValue
      );
    };

    useEffect(() => {
      if (remainingSecondsToExpire <= 0) {
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
      // var seconds = remainingSecondsToExpire * 3600;
      const timer = setTimeout(
        () => {
          setRemainingSecondsToExpire(remainingSecondsToExpire - 1);
        },
        // onChangeInput,
        1000
      );

      intervalRef.current = timer;
      return () => {
        clearInterval(intervalRef.current!);
      };
    }, [remainingSecondsToExpire]);

    async function fetchData() {
      setPhoneNumbersPayload(undefined);
      setOrderScreenDynamics(await screen.getScreenDynamics());
      await selectRandomPhoneNumber(Actions.BROWSE, 1);
    }

    const generatePhoneNumbers = (response: any) => {
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
    };

    async function selectRandomPhoneNumber(
      action: Actions,
      qty: number,
      oldPhoneNumbers?: PhoneNumbers
    ) {
      let requestInput: SelectPhoneNumberInput = {
        action: action,
        quantity: qty,
        salesOrderId: getSalesOrder().salesOrderId,
        customerId: getSalesOrder().customer.id,
        productOfferingId: getSalesOrder().product.id,
        parentOrderItemId: getSalesOrder().orderItemId!,
        vipCategoryIds: oldPhoneNumbers ? undefined : idArray,
        phoneNumbers: oldPhoneNumbers,
      };

      const response = await selectPhoneNumbers(requestInput);
      if (response) {
        if (
          response?.data?.selectPhoneNumbers?.phoneNumbers.length <= 0 &&
          !isFirstTimeLockPhoneNumber
        ) {
          //cannot trigger at the first attempt
          setNoAvailableNumbersAlertVisibility(true);
          return;
        }
        setPhoneNumbersPayload(response);
        generatePhoneNumbers(response?.data?.selectPhoneNumbers);
        getSalesOrder().msisdn!.msisdnId =
          response?.data?.selectPhoneNumbers?.phoneNumbers[0]?.phoneNumber?.phoneNumber;
        getSalesOrder().msisdn!.reservationDate =
          response?.data?.selectPhoneNumbers?.phoneNumbers[0]?.phoneNumber?.reservationDate;
        let reservationDate =
          response?.data?.selectPhoneNumbers?.phoneNumbers[0]?.phoneNumber?.reservationDate;
        setRemainingSecondsToExpire(
          new Date(reservationDate!).getTime() +
          12 * 60 * 60 * 1000 -
          new Date().getTime()
        );
        for (let phoneNumberObject of response.data.selectPhoneNumbers.phoneNumbers) {
          if (phoneNumberObject.phoneNumber.status === 'LOCKED' || 'RESERVED') {
            setPhoneNumberLocked(true);
          }
        }
        setIsFirstTimeLockPhoneNumber(false);
      }
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

    const analyticLogPressEligibilityCheck = () => {
      let analytics: DuAnalyticsPlugin = new DuAnalyticsFirebasePlugin();
      analytics.logEvent('Continue_To_Eligibility_Check_Button_Click', {
        event_category: 'Continue to eligibility check button',
        event_label: 'Continue to eligibility check',
        event_name: 'Assigned a number: Continue to eligibility check',
        event_action: 'Continue to eligibility check button Click',
      });
    };

    const analyticLogPressBrowseNumbers = () => {
      let analytics: DuAnalyticsPlugin = new DuAnalyticsFirebasePlugin();
      analytics.logEvent('Browse_More_Numbers_Button_Click', {
        event_category: 'Browse more numbers button',
        event_label: 'Browse more numbers',
        event_name: 'Assigned a number: Browse more numbers',
        event_action: 'Browse more numbers button Click',
      });
    };

  const headerProps: DuHeaderProps = {
    left: 'back',
    leftTertiaryText: env?.close_common_text,
    safeArea: true,
    leftPressed: () => {
      Platform.OS === 'android' && StatusBar.setBackgroundColor('white');
      if (Platform.OS === 'android') {
        StatusBar.setBarStyle('dark-content', true);
      }
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
    },
    right: 'tertiary',
    rightTertiary: {
      text: env?.your_assigned_header_right_text,
      disable: true,
    },
    statusBar: { barStyle: 'dark-content', backgroundColor: 'white' },
    background: 'white',
  };

    const TextWithSufixIcon: FC<TextWithSufixIconProps> = ({ text, icon }) => {
      return (
        <View style={styles.suffixTextContainer}
          {...setTestID(`${testIds.CustomerYourAssinedNumberTextWithSufixIconView}_${icon ?? "_"}`)}>
          <Text style={styles.suffixText}  {...setTestID(`${testIds.CustomerYourAssinedNumberTextWithSufixIconText}_${icon ?? "_"}`)}>{text}</Text>
          <DuIcon  {...setTestID(`${testIds.CustomerYourAssinedNumberTextWithSufixIconDuicon}_${icon ?? "_"}`)}
            iconName={icon}
            artWorkHeight={24}
            artWorkWidth={24}
            iconColor="#737B8D"
          />
        </View>
      );
    };

  if (!phoneNumbersPayload) {
    return <Text  {...setTestID(`${testIds.CustomerYourAssinedNumberphoneNumbersPayload}_`)}>
     {env?.common_loading_text}
      </Text>;
  }

    const addExistingOrder = async () => {
      const bssListProductOfferingsResponce = await getBssListProductOfferings();
      setBssListProductOfferingsResponce(bssListProductOfferingsResponce[0].id);

      let requestInput: AddorderitemunderparentInputs = {
        orderItemId: getSalesOrder()?.orderItemId!,
        productOffering: {
          id: bssListProductOfferings,
          characteristics: [
            {
              name: 'MSISDN',
              value:
                phoneNumbersPayload?.data.selectPhoneNumbers.phoneNumbers[0]
                  .phoneNumber.id!,
            },
            { name: 'Carrier', value: 'Virgin' },
            {
              name: 'SIM Card Type',
              value: emSimSwitchCheck ? 'eSIM' : 'Physical SIM',
            },
          ],
        },
      };
      await addExistingOrderItemUnderParent(requestInput);
    };

  return (
    <View style={styles.root}>
      {Platform.OS === 'ios' ? (
        <View style={styles.iosStackHeaderPadding} />
      ) : (
        <View style={{ marginBottom: safeAreaInsets.top }} />
      )}
      {/* <DuIcon iconName="left-chevron" /> */}
      <DuHeader
        {...setTestID(testIds?.CustomerYourAssignedNumberScreenDuHeader)}
        {...headerProps}
      />
      <ScrollView>
        <View style={styles.jumbotronContainer}>
          <DuJumbotron
            {...setTestID(testIds?.CustomerYourAssignedNumberScreenDuJumbotron)}
            alignment={'left'}
            mainJumbotron={env?.your_assigned_number_common_text}
            // mainJumbotron={
            //   orderScreenDynamics?.fields.assigned_number_model.mapValue.fields
            //     .heading.mapValue.fields.en.mapValue.fields.plain_text
            //     ?.stringValue
            // }
            contanierStyle={styles.jumbotronContainerStyle}
            size={'xxlarge'}
          />
        </View>
        <View style={styles.subContainer}>
          <View
            style={[
              styles.numberAndButtonContainer,
              // eslint-disable-next-line react-native/no-inline-styles
            ]}  {...setTestID(`${testIds.CustomerYourAssinedNumberPhoneNUmberView}_`)}
          >
            <View style={styles.badgeAndButtonContainer}>
              <View>
                <MaskedText
                  style={StyleSheet.flatten([
                    styles.number,
                    { color: !phoneNumberLocked ? '#B9BDC6' : '#041333' },
                  ])}
                  mask="999 999 9999"
                >
                  {phoneNumbers.phoneNumber.phoneNumber}
                </MaskedText>
              </View>
              <DuButton
                {...setTestID(
                  testIds?.CustomerYourAssignedNumberScreenDuButton1
                )}
                type="teritary"
                title={
                  orderScreenDynamics?.fields.assigned_number_model.mapValue
                    .fields.lines.arrayValue.values[0].mapValue.fields.shuffle
                    .mapValue.fields.en.mapValue.fields.plain_text?.stringValue
                }
                size="small"
                disabled={disabledBtn}
                icon={{ iconName: 'refresh' }}
                containerStyle={styles.shuffleButton}
                onPress={async () => {
                  // setExpired(false);
                  // lockPhoneNumberOnScreen();
                  setDisabledBtn(true);
                  await selectRandomPhoneNumber(Actions.BROWSE, 1);
                  setDisabledBtn(false);
                }}
              />
            </View>
            <View style={styles.browsMoreButton}>
              <DuButton
                {...setTestID(
                  testIds?.CustomerYourAssignedNumberScreenDuButton2
                )}
                type="secondary"
                title={env?.browse_numbers_common_text}
                size="small"
                disabled={disabledBtn}
                onPress={() => {
                  setDisabledBtn(true);
                  analyticLogPressBrowseNumbers();
                  // navigation.navigate('BrowseMoreNumberScreen' as never);
                  onBrowseMoreTap && onBrowseMoreTap();
                  setDisabledBtn(false);
                }}
              />
            </View>
            <View style={styles.emSimSwitchContainer}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text
                  style={StyleSheet.flatten([
                    styles.grayInfoDecription,
                    { color: !phoneNumberLocked ? '#B9BDC6' : '#737B8D' },
                  ])}  {...setTestID(`${testIds.CustomerYourAssinedNumberProceedText}_`)}
                >
                  {env?.proceed_with_esim_text}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setIsSimModal(true);
                  }}  {...setTestID(`${testIds.CustomerYourAssinedNumberouchableOpacity}_`)}
                >
                  <DuIcon
                    {...setTestID(
                      testIds?.CustomerYourAssignedNumberScreenDuIcon
                    )}
                    iconName={'info'}
                    artWorkHeight={24}
                    artWorkWidth={24}
                    iconColor={!phoneNumberLocked ? '#B9BDC6' : '#737B8D'}
                  />
                </TouchableOpacity>
              </View>
              <DuSwitch
                {...setTestID(
                  testIds?.CustomerYourAssignedNumberScreenDuSwitch
                )}
                disabled={
                  // emSimSwitchDisable || !phoneNumberLocked || isFromCheckOut
                  false
                }
                onValueChange={() =>
                  setEmSimSwitchCheck((previousState) => !previousState)
                }
                // @ts-ignore
                value={emSimSwitchCheck}
              />
            </View>
          </View>
          <View style={{ height: 16 }} />
          {numberExpiredState.expiredState ===
            NumberExpiredStates.NOTEXPIRED && (
            <TextWithSufixIcon
              icon="info"
              text={env?.your_assigned_reseved_24hrs_text}
               {...setTestID(`${testIds.CustomerYourAssinedNumberextWithSufixIco}_`)}
            />
          )}
          {numberExpiredState.expiredState === NumberExpiredStates.EXPIRED && (
            <DuBanner
              {...setTestID(testIds?.CustomerYourAssignedNumberScreenDuBanner1)}
              buttontitle=""
              icon={{
                iconName: 'warning',
                iconColor: '#BA0023',
                artWorkHeight: 23.33,
                artWorkWidth: 23.33,
              }}
              title={env?.number_expired_find_new_common_text}
              type="danger"
            />
          )}
          {phoneNumberLocked == true && (
            // {numberExpiredState.expiredState ===
            //   NumberExpiredStates.LESSTHANFOURHOURSTOEXPIRE && (
            <DuBanner
              {...setTestID(testIds?.CustomerYourAssignedNumberScreenDuBanner2)}
              buttontitle=""
              icon={{
                iconName: 'info',
                iconColor: '#C79C02',
                artWorkHeight: 23.33,
                artWorkWidth: 23.33,
              }}
              title={env?.expire_soon_keep_it_text}
              type="warning"
            />
          )}
        </View>
      </ScrollView>
      <DuOverlay
        {...setTestID(testIds?.CustomerYourAssignedNumberScreenDuOverlay1)}
        overlayStyle={styles.overlayStyle}
        backdropStyle={styles.backdropStyle}
        isVisible={noAvailableNumbersAlertVisibility}
        onBackdropPress={() => {
          setNoAvailableNumbersAlertVisibility(false);
        }}
      >
        <DuDialog
          {...setTestID(testIds?.CustomerYourAssignedNumberScreenDuDialog1)}
          icon={{
            iconName: 'info',
            iconColor: '#00A9CE',
            artWorkWidth: 30,
            artWorkHeight: 30,
          }}
          headline={env?.your_assigned_dialog_heaadline}
          body={env?.your_assigned_dialog_body}
          primaryText={env?.close_common_text}
          pressedPrimary={() => {
            setNoAvailableNumbersAlertVisibility(false);
          }}
        />
      </DuOverlay>
      <DuButtonsDock
        {...setTestID(testIds?.CustomerYourAssignedNumberScreenDuButtonsDock)}
        shadow={true}
        items={[
          // phoneNumberLocked ? (
          //   <AmountDockItem
          //     title={'Total'}
          //     titleValue={
          //       getSalesOrder().product.plan.price.currencyCode +
          //       ' ' +
          //       getSalesOrder().product.plan.price.amount.toFixed(2)
          //     }
          //     captionValue={'Incl 5% VAT'}
          //     caption={getSalesOrder().product.name}
          //   />
          // ) : (
          //   <View></View>
          // ),
          <DuButton
            {...setTestID(testIds?.CustomerYourAssignedNumberScreenDuButton3)}
            title={
              isFromCheckOut? `${env?.select_this_number_common_text}` : `${env?.your_assigned_continue_with_text}`
            }
            type="primary"
            onPress={() => {
              analyticLogPressEligibilityCheck();
              if (isFromCheckOut) {
                if (phoneNumbersPayload) {
                  addExistingOrder();
                  redirectToCheckout &&
                    redirectToCheckout(getSalesOrder(), {
                      msisdn:
                        phoneNumbersPayload.data.selectPhoneNumbers.phoneNumbers[0]
                          .phoneNumber.phoneNumber!,
                    });
                }
              } else {
                if (phoneNumbersPayload) {
                  addExistingOrder();
                  numberSelectionComplete &&
                    numberSelectionComplete(getSalesOrder(), {
                      msisdn:
                        phoneNumbersPayload.data.selectPhoneNumbers.phoneNumbers[0]
                          .phoneNumber.phoneNumber!,
                    });
                }
              }
            }}
            disabled={!phoneNumberLocked}
          />,
        ]}
      />
      <DuOverlay
        {...setTestID(testIds?.CustomerYourAssignedNumberScreenDuOverlay2)}
        isVisible={overlayVisibility}
        overlayStyle={styles.overlay}
        onBackdropPress={() => {
          setOverlayVisibility(false);
        }}
      >
        <DuDialog
          {...setTestID(testIds?.CustomerYourAssignedNumberScreenDuDialog2)}
          headline={''}
          body={error?.message}
          primaryText={'Ok'}
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
      <DuSheet
        isVisible={isESimModal}
        onClose={() => setIsSimModal(false)}
        sheetBody={
          <View style={styles.modalView}>
            <TouchableOpacity
              testID="closeButton"
              style={styles.close}
              onPress={() => setIsSimModal(false)}
            >
              <DuIcon
                iconName="close-circle"
                artWorkWidth={20}
                artWorkHeight={20}
                style={styles.closeCircle}
                iconColor={'#A4A9B5'}
              />
            </TouchableOpacity>
            <View
              style={styles.containerView}
            >
              <DuIcon iconName="info" iconColor='#00A9CE' iconSize={30} />
            </View>
            <DuJumbotron
              mainJumbotron={"What's an eSIM?"}
              size="medium"
              alignment="center"
              contanierStyle={styles.instructionContainer}
              mainTextStyles={styles.titleText}
              description='An eSIM is a digital SIM that allows you to activate your cellular plan with us without having to use a physical SIM.'
              descriptionTextStyles={styles.instructionText}
            />
            <DuButton
              title={'Got it'}
              disabled={false}
              onPress={() => { 
                setIsSimModal(false);
              }}
              containerStyle={styles.gotItButton}
              iconRight={false}
            />
            <DuButton
              title={'Learn more'}
              disabled={false}
              onPress={() => {
                onLearnMorePress && onLearnMorePress();

                setIsSimModal(false);
              }}
              type="secondary"
              containerStyle={styles.learnMoreView}
              iconRight={false}
            />
          </View>
        }
      />
    </View>
  );
};

export default CustomerYourAssignedNumberScreen;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'white' },
  subContainer: { flex: 1, backgroundColor: 'white', paddingHorizontal: 16 },
  iosStackHeaderPadding: { marginBottom: 14 },
  grayBanner: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#F5F6F7',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  grayBannerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    textAlign: 'left',
    letterSpacing: -0.2,
    lineHeight: 20,
    color: '#041333',
  },
  overlayStyle: {
    marginHorizontal: 16,
    borderRadius: 12,
  },
  backdropStyle: {
    backgroundColor: '#041333',
    opacity: 0.8,
  },
  grayBannerDecription: {
    marginTop: 8,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    textAlign: 'left',
    lineHeight: 20,
    color: '#5E687D',
  },
  grayInfoDecription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    textAlign: 'left',
    lineHeight: 20,
    paddingRight: 5,
  },
  purple: { color: '#753BBD' },
  numberAndButtonContainer: {
    // marginTop: 24,
    padding: 16,
    borderColor: '#D7D9DE',
    borderWidth: 1,
    borderRadius: 12,
  },
  badgeAndButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shuffleButton: { paddingHorizontal: 0 },
  number: {
    fontFamily: 'Inter-Bold',
    fontSize: 22,
    textAlign: 'left',
    letterSpacing: -0.3,
  },
  browsMoreButton: {
    marginTop: 32,
    flexDirection: 'row',
  },
  overlay: {
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
    elevation: 0,
  },
  jumbotronContainer: {
    marginTop: 16,
    marginBottom: 18,
    width: '90%',
  },
  jumbotronContainerStyle: {
    padding: 16,
  },
  suffixTextContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  suffixText: {
    fontFamily: 'Inter-Regular',
    fontStyle: 'normal',
    fontSize: 14,
    lineHeight: 20,
    color: '#5E687D',
    marginRight: 5,
  },
  emSimSwitchContainer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gotItButton: {
    backgroundColor: '#753BBD',
    marginBottom: 4,
    marginHorizontal: 16
  },
  instructionContainer: { marginBottom: 32, marginTop: 8, },
  titleText: { fontWeight: '800', fontSize: 26, marginTop: 8 },
  instructionText: { marginHorizontal: 16, fontSize: 14, fontWeight: '400', color: "#3B4559" },
  learnMoreView: { marginTop: 4, marginHorizontal: 10 },
  containerView: {
    height: 68,
    width: 68,
    borderRadius: 50,
    backgroundColor: '#F6F6F8',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14
  },
  modalView: { height: 382 },
  close: { alignItems: 'flex-end', marginTop: 10 },
  closeCircle: { marginRight: 20 }
});
