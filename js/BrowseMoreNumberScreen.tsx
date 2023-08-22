import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  DuButton,
  DuButtonsDock,
  DuHeader,
  DuIcon,
  DuHeaderProps,
  DuListItemStatic,
  DuJumbotron,
  // DuOverlay,
} from '@du-greenfield/du-ui-toolkit';
import React, { FC, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { CustomerNavigatorParamList } from '../../../navigator';
import {
  Actions,
  PhoneNumbers,
  SelectPhoneNumberInput,
  SelectPhoneNumbers,
} from '../../../utils/gql/models';
import { selectPhoneNumbers } from '../../../utils';
import { getMicroAppContext, getSalesOrder, microappId } from '../../../';
import type { Msisdn, Order } from '@du-greenfield/du-commons';
import { RootStateOrAny, useDispatch, useSelector } from 'react-redux';
import { loadAsyncStorage } from '@du-greenfield/du-env-abstraction-plugin';
import testIds, { setTestID } from '../../../assets/support/testIds';
import NumberInput from '../../../components/NumberInput';
import { phoneNumberSelected } from '../../../redux/features/phoneNumbersSlice';
import DuAnalyticsFirebasePlugin from '@du-greenfield/du-firebase-analytics';
import { DuAnalyticsPlugin, DuAnalyticsTagBuilder } from '@du-greenfield/du-analytics-plugin-core';

import { useEnvironmentAbstract } from '@du-greenfield/du-abstract-environment-plugin'
export type BrowseMoreNumberScreenProps = NativeStackScreenProps<
  CustomerNavigatorParamList,
  'BrowseMoreNumberScreen'
> & {
  params: any;
  numberSelectionComplete: (order: Order, selectedMsisdn: Msisdn) => void;
  redirectToCheckout: (order: Order, selectedMsisdn: Msisdn) => void;
  helpButtonPressedOnOrder: (routeName: string) => void;
  gotoDashboardClicked: () => void;
  mockphoneNumbersPayload?: any;
};

const BrowseMoreNumberScreen: FC<BrowseMoreNumberScreenProps> = ({
  navigation,
  numberSelectionComplete,
  redirectToCheckout,
  helpButtonPressedOnOrder,
  gotoDashboardClicked,
  route,
}) => {
  const dispatch = useDispatch();
  const routePath = route;
  const timeout = 720;
  const intervalRef = useRef<NodeJS.Timer | null>(null);
  const [seconds, setSeconds] = useState(timeout);
  const [expired, setExpired] = useState<boolean>(false);
  const safeAreaInsets = useSafeAreaInsets();
  const [disabledButton, setDisabledButton] = useState<boolean>(false);
  const [checkedPhoneNumber, setCheckedPhoneNumber] = useState<{
    id: string;
    number: string;
  }>({ id: '', number: '' });
  const [phoneNumbersPayload, setPhoneNumbersPayload] = useState<
    SelectPhoneNumbers | undefined
  >(undefined);
  const [isFromCheckOut, setIsFromChekout] = useState<boolean | undefined>(
    false
  );
  const [isAvailablelSpecialNumber, setIsAvailablelSpecialNumber] =
    useState<boolean>(false);
  const [, /*isAvailablelSearchNumber*/ setIsAvailablelSearchNumber] =
    useState<boolean>(true);
  const [phoneNumbers, setPhoneNumbers] = useState<any | undefined>([]);

  // const dispatch = useDispatch();
  const [contextualSupport] = useState<boolean>(
    getMicroAppContext().appData.ContextualSupport
  );
  const phoneNumberState = useSelector(
    (state: RootStateOrAny) => state.phoneNumberSlice
  );
  const env = useEnvironmentAbstract(
    [microappId],
    getMicroAppContext()?.appLanguage!,
    getMicroAppContext()?.appType
  );
  // @ts-ignore
  let idArray: Array<string> = [];

  // const phoneNumbers = useSelector(
  //   (state: RootStateOrAny) => state.phoneNumberSlice
  // );

  useEffect(() => {
    console.log(
      'selectphonenumbers-------->phoneNumbersPayload',
      phoneNumbersPayload
    );
  }, [phoneNumbersPayload]);
  /* istanbul ignore next */
  async function selectRandomPhoneNumber(
    action: Actions,
    qty?: number,
    // @ts-ignore
    oldPhoneNumbers?: PhoneNumbers
  ) {
    idArray = await loadAsyncStorage('vip-id-array');
    let requestInput: SelectPhoneNumberInput = {
      action: action,
      quantity: qty,
      salesOrderId: getSalesOrder().salesOrderId,
      customerId: getSalesOrder().customer.id,
      productOfferingId: getSalesOrder().product.id,
      parentOrderItemId: getSalesOrder().orderItemId!,

      // vipCategoryIds: oldPhoneNumbers ? undefined : idArray,
      // phoneNumbers: oldPhoneNumbers,
    };

    console.log('INPUTS::::', requestInput);

    const response = await selectPhoneNumbers(requestInput);
    console.log('RANDOM RESPONSE::::', response);
    if (response?.data.selectPhoneNumbers) {
      setPhoneNumbersPayload(response);
      setPhoneNumbers(response.data.selectPhoneNumbers.phoneNumbers);
      getSalesOrder()!.msisdn!.msisdnId =
        response.data.selectPhoneNumbers.phoneNumbers[0].phoneNumber.phoneNumber;
      getSalesOrder()!.msisdn!.reservationDate =
        response.data.selectPhoneNumbers.phoneNumbers[0].phoneNumber.reservationDate;
      setCheckedPhoneNumber({
        id: response.data.selectPhoneNumbers.phoneNumbers[0].phoneNumber.id!,
        number:
          response.data.selectPhoneNumbers.phoneNumbers[0].phoneNumber.phoneNumber!,
      });
      dispatch(
        phoneNumberSelected({
          phoneNumber:
            response.data.selectPhoneNumbers.phoneNumbers[0].phoneNumber.phoneNumber,
        })
      );
    }
  }

  useEffect(() => {
    selectRandomPhoneNumber(Actions.BROWSE, 5);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setIsFromChekout(getMicroAppContext().flags?.fromChekout);
    /* istanbul ignore next */
    if (seconds <= 0) {
      selectRandomPhoneNumber(Actions.BROWSE, 5);
      setExpired(true);
      setTimeout(() => {
        refreshNumbers();
      }, 500);
      return;
    }
    /* istanbul ignore next */
    const timer = setTimeout(() => setSeconds(seconds - 1), 1000);
    intervalRef.current = timer;
    return () => {
      clearInterval(intervalRef.current!);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds]);

  /* istanbul ignore next */
  async function refreshNumbers() {
    setDisabledButton(true);
    setPhoneNumbersPayload(undefined);
    setExpired(false);
    setSeconds(timeout);
    await selectRandomPhoneNumber(Actions.BROWSE, 5);
    setDisabledButton(false);
  }

  /* istanbul ignore next */
  function handleNumberSelection(id: string) {
    for (let number of phoneNumbersPayload?.data.selectPhoneNumbers.phoneNumbers!) {
      if (id === number.phoneNumber.id) {
        setCheckedPhoneNumber({
          number: number.phoneNumber.phoneNumber!,
          id: number.phoneNumber.id,
        });
        dispatch(
          phoneNumberSelected({ phoneNumber: number.phoneNumber.phoneNumber })
        );
      }
    }
  }

  /* istanbul ignore next */
  const checkAvailability = () => {
    const filteredData =
      phoneNumbersPayload?.data.selectPhoneNumbers?.phoneNumbers?.filter(
        (x: any) =>
          x.phoneNumber.phoneNumber
            ?.toString()
            .split(' ')
            ?.join('')
            .indexOf(
              phoneNumberState.specificNumber.toString()?.split(' ')?.join('')
            ) !== -1
      );
    setPhoneNumbers(filteredData);

    if (filteredData?.length! > 0) {
      setIsAvailablelSearchNumber(true);
      setIsAvailablelSpecialNumber(true);
    } else {
      setIsAvailablelSpecialNumber(false);
      setIsAvailablelSearchNumber(false);
    }
  };

  /* istanbul ignore next */
  useEffect(() => {
    checkAvailability && checkAvailability();
  }, [phoneNumberState?.specificNumber]);

  /* istanbul ignore next */
  const renderSpecificTitle = (params: string) => {
    let stringPriorToSelected = '';
    let stringAfterSelected = '';
    let slectedString: string = '';

    const searchParam = params.slice(4, 12).replace(/ /g, '');
    if (phoneNumberState?.specificNumber.length > 0) {
      const breakPoint = searchParam.search(phoneNumberState?.specificNumber);

      if (breakPoint > 0) {
        stringPriorToSelected = searchParam.slice(0, breakPoint);
      }

      slectedString = searchParam.slice(
        breakPoint,
        breakPoint + phoneNumberState?.specificNumber.length
      );

      let filteredLength = stringPriorToSelected.length + slectedString.length;

      if (filteredLength <= searchParam.length) {
        stringAfterSelected = searchParam.slice(
          filteredLength,
          searchParam.length
        );
      }

      if (slectedString.length > 2 && stringPriorToSelected.length >= 3) {
        stringPriorToSelected =
          stringPriorToSelected.slice(0, 3) +
          ' ' +
          stringPriorToSelected.slice(3, stringPriorToSelected.length);
      } else if (
        slectedString.length > 2 &&
        stringPriorToSelected.length == 2
      ) {
        slectedString =
          slectedString.slice(0, 1) +
          ' ' +
          slectedString.slice(1, slectedString.length);
      } else if (
        slectedString.length > 2 &&
        stringPriorToSelected.length == 1
      ) {
        slectedString =
          slectedString.slice(0, 2) +
          ' ' +
          slectedString.slice(2, slectedString.length);
      } else if (
        slectedString.length >= 3 &&
        stringPriorToSelected.length == 0
      ) {
        slectedString =
          slectedString.slice(0, 3) +
          ' ' +
          slectedString.slice(3, slectedString.length);
      } else {
        stringPriorToSelected =
          stringPriorToSelected.length == 3
            ? stringPriorToSelected.slice(0, 3) + ' '
            : '';
      }
    }
    return (
      <View style={{ flexDirection: 'row', flex: 1 }}>
        <Text
          style={{
            fontSize: 16,
            color: '#181C24',
            fontFamily: 'Inter-Regular',
          }}
          {...setTestID(
            `${testIds.BrowseMoreNumberScreenV2paramsView}_${params ?? '_'}`
          )}
        >
          {params.slice(0, 3) + ' ' + stringPriorToSelected}
        </Text>
        <Text
          style={{
            fontSize: 16,
            color: '#181C24',
            fontFamily: 'Inter-Bold',
          }}
          {...setTestID(
            `${testIds.BrowseMoreNumberScreenV2paramsText}_${params ?? '_'}`
          )}
        >
          {slectedString}
        </Text>
        <Text
          style={{
            fontSize: 16,
            color: '#181C24',
            fontFamily: 'Inter-Regular',
          }}
          {...setTestID(
            `${testIds.BrowseMoreNumberScreenV2stringAfterSelected}_${params ?? '_'
            }`
          )}
        >
          {stringAfterSelected}
        </Text>
      </View>
    );
  };

  /* istanbul ignore next */
  const getFormattedNumber = (phoneNumber: string): string => {
    const firstThreeDigits = phoneNumber?.substring(0, 3);
    let formattedPhoneNumber = phoneNumber;

    if (firstThreeDigits === '971') {
      formattedPhoneNumber = `0${phoneNumber.substring(3)}`;
    }
    return formattedPhoneNumber;
  };

  /* istanbul ignore next */
  const renderTitle = (
    params: string,
    item: { phoneNumber: { vipCategory: { name: string } } }
  ) => {
    return (
      <View style={{ flexDirection: 'row', flex: 1, alignItems: 'center' }}>
        <Text
          style={{
            fontSize: 16,
            color: '#181C24',
            fontFamily: 'Inter-Bold',
          }}
          {...setTestID(
            `${testIds.BrowseMoreNumberScreenV2renderTitleparams}_${params ?? '_'
            }`
          )}
        >
          {getFormattedNumber(params)}
        </Text>
        {item?.phoneNumber?.vipCategory?.name && (
          <Image
            source={require('../../../assets/img/Tier.png')}
            style={{ width: 68, height: 20, position: 'absolute', left: 120 }}
            resizeMode="contain"
          />
        )}
      </View>
    );
  };

  const headerProps: DuHeaderProps = {
    //@ts-ignore
    leftButtonTestID: 'DH_TEST',
    left: 'back',
    leftPressed: () => {
      /* istanbul ignore next */
      Platform.OS === 'android' && StatusBar.setBackgroundColor('white');
      /* istanbul ignore next */
      if (Platform.OS === 'android') {
        StatusBar.setBarStyle('dark-content', true);
      }

      /* istanbul ignore next */
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
    },
    navToDashBoard: true,
    rightTertiarySupport: {
      /* istanbul ignore next */
      pressed: () => {
        /* istanbul ignore next */
        gotoDashboardClicked();
      },
    },
    right: 'tertiary',
    rightTertiary: contextualSupport
      ? {
        text: 'Help',
        //disable: true,
        pressed: () => {
          /* istanbul ignore next */
          helpButtonPressedOnOrder(routePath.name);
        },
      }
      : undefined,
  };

  /* istanbul ignore next */
  const _getTime = (_seconds: number): string => {
    var mmssFormat = new Date(_seconds * 1000).toISOString().substr(14, 5);
    return mmssFormat;
  };

  if (!phoneNumbersPayload) {
    return (
      <View style={styles.loadingView}>
        <Text {...setTestID(`${testIds.BrowseMoreNumberScreenV2loadng}_`)}>
         {env?.common_loading_text}
        </Text>
      </View>
    );
  }

  const onBrowsMoreNumber = (typeName:string,type:string) => {
    let analytics: DuAnalyticsPlugin = new DuAnalyticsFirebasePlugin();
    let tagBuilder = new DuAnalyticsTagBuilder();
    let params = tagBuilder
      .journeyName('postpaid + device - dealer app')
      .subJourneyName(`postpaid + device : new number`)
      .screenName('DIP - device details')
      .clickCtaName(typeName)
      .clickCtaType(type)
      .planId(getSalesOrder().product.id.toLowerCase())
      .planName(getSalesOrder().product.name.toLowerCase())
      .build()
    analytics.logEvent('click_cta', params);
  }

  return (
    <View style={styles.root}>
      {Platform.OS === 'ios' ? (
        <View style={styles.iosStackHeaderPadding} />
      ) : (
        <View style={{ marginBottom: safeAreaInsets.top }} />
      )}
      <DuHeader
        {...setTestID(testIds?.DealerBrowseMoreNumberScreenDuHeader)}
        {...headerProps}
      />
      <View style={styles.scrollViewConntainerStyle}>
        <DuJumbotron
          {...setTestID(testIds?.DealerBrowseMoreNumberScreenDuJumbotron)}
          size="xxlarge"
          alignment="center"
          mainJumbotron={env?.browse_more_jumbotron_title}
        />
        <View style={styles.subContainer}>
          <View style={{ height: 80, alignItems: 'center' }}>
            <NumberInput
              containerStyle={{ width: 450, left: 70 }}
              testID="NI_TEST"
            />
          </View>
          <View
            style={{ height: 1, width: 450, backgroundColor: '#E1E2E6' }}
          ></View>
          <Text
            style={[
              styles.selectedNumber,
              { marginTop: 10, color: '#677084', fontSize: 13 },
            ]}
          >
           {env?.browse_more_enter_3_digits_text}
          </Text>
          {phoneNumberState.specificNumber?.length === 0 && (
            <View style={styles.grayBanner}>
              <View
                style={{
                  flex: 3,
                  paddingRight: 30,
                }}
              >
                {expired ? (
                  <Text style={styles.grayBannerTitle}>
                    {env?.numbers_have_expired_common_text}
                  </Text>
                ) : (
                  <View style={styles.bannerInner}>
                    <DuIcon
                      {...setTestID(
                        testIds?.DealerBrowseMoreNumberScreenDuIcon2
                      )}
                      iconName="warning"
                      iconSize={16}
                    />
                    <View style={styles.bannerDescriptionContainer}>
                      <Text
                        style={styles.grayBannerTitle}
                        {...setTestID(
                          `${testIds.BrowseMoreNumberScreenV2seondText}_`
                        )}
                      >
                       {env?.numbers_are_locked_common_text}{' '}
                        <Text style={styles.purple}>{_getTime(seconds)}</Text>
                      </Text>
                      <Text
                        style={styles.grayBannerDecription}
                        {...setTestID(
                          `${testIds.BrowseMoreNumberScreenV2expired}_`
                        )}
                      >
                        {expired ? `${env?.have_expired_shuffle_get_new_common_text}` : `${env?.browse_more_reserved_pick_text}`}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
              <View
                style={{
                  flex: 1,
                  alignItems: 'flex-end',
                }}
                {...setTestID(`${testIds.BrowseMoreNumberScreenV2View2}_`)}
              >
                <DuButton
                  {...setTestID(testIds?.DealerBrowseMoreNumberScreenDuButton1)}
                  disabled={disabledButton}
                  type="teritary"
                  title="Shuffle"
                  size="small"
                  icon={{ iconName: 'refresh' }}
                  containerStyle={[styles.shuffleButton]}
                  onPress={() => {
                    refreshNumbers();
                  }}
                />
              </View>
            </View>
          )}

          {phoneNumbers &&
            phoneNumbers.length === 0 &&
            phoneNumberState?.specificNumber?.length > 0 ? (
            <View style={{ alignItems: 'center' }}>
              <Image
                source={require('../../../assets/img/info.png')}
                style={{
                  height: 40,
                  width: 40,
                  marginTop: 44,
                  marginBottom: 20,
                }}
              />
              <DuJumbotron
                {...setTestID(testIds?.DealerBrowseMoreNumberScreenDuJumbotron)}
                alignment={'center'}
                mainJumbotron={env?.no_results_found_common_text}
                description={env?.browse_more_jumbtron_2_description}
              />
              <DuButton
                {...setTestID(testIds?.DealerYourAssignedNumberScreenDuButton2)}
                type="secondary"
                title={env?.browse_numbers_common_text}
                size="small"
                  onPress={() => {
                    onBrowsMoreNumber('Browse numbers', 'button')
                }}
                buttonStyle={{ marginTop: 15 }}
              />
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{ height: '100%', width: 900 }}>
                <FlatList
                  keyExtractor={(_, index) => index.toString()}
                  data={phoneNumbers}
                  renderItem={({ item, index }: any) => {
                    const isEnd =
                      index ===
                      phoneNumbersPayload!.data.selectPhoneNumbers.phoneNumbers
                        .length -
                      1;
                    return (
                      <DuListItemStatic
                        {...setTestID(
                          `${testIds.BrowseMoreNumberScreenV2DuListItemStatic
                          }_${index ?? '_'}`
                        )}
                        bottomDivider={!isEnd}
                        checkListType={'radio'}
                        //@ts-ignore
                        isSpecificTitle={true}
                        specificTitle={
                          isAvailablelSpecialNumber &&
                            phoneNumberState?.specificNumber?.length > 2
                            ? renderSpecificTitle(item.phoneNumber.phoneNumber)
                            : renderTitle(item.phoneNumber.phoneNumber, item)
                        }
                        onCheckListValueChange={() =>
                          handleNumberSelection(item.phoneNumber.id)
                        }
                        enableCheckList={!expired}
                        containerStyle={{
                          marginHorizontal: 14,
                          height: 56,
                          alignItems: 'center',
                          padding: 16,
                        }}
                        checkListValue={
                          checkedPhoneNumber.number ===
                            item.phoneNumber.phoneNumber
                            ? true
                            : false
                        }
                      />
                    );
                  }}
                />
              </View>
            </ScrollView>
          )}
        </View>
      </View>

      <DuButtonsDock
        {...setTestID(`${testIds.BrowseMoreNumberScreenV2DuButtonsDock}_`)}
        items={[
          <Text
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
            }}
            {...setTestID(
              `${testIds.BrowseMoreNumberScreenV2DuButtonsDockText}_`
            )}
          >
            {env?.customer_new_number_will_common_text}{' '}
            <Text style={{ fontWeight: '700' }}>
              {phoneNumberState?.phoneNumber?.phoneNumber}
            </Text>
          </Text>,
        ]}
      />
      <DuButtonsDock
        {...setTestID(testIds?.DealerBrowseMoreNumberScreenDuButtonsDock)}
        shadow
        items={[
          <DuButton
            {...setTestID(testIds?.DealerBrowseMoreNumberScreenDuButton2)}
            title={
              isFromCheckOut ?`${env?.select_this_number_common_text}` :`${env?.confirm_and_proceed_common_text}`
            }
            type="primary"
            onPress={() => {
              /* istanbul ignore next */
              setDisabledButton(true);
              /* istanbul ignore next */
              if (isFromCheckOut) {
                if (checkedPhoneNumber.number.length > 0) {
                  var oldPhoneNumbers: PhoneNumbers = {
                    oldPhoneNumberId: getSalesOrder().msisdn?.msisdnId!,
                    newPhoneNumberId: checkedPhoneNumber.number,
                    orderItemId: getSalesOrder().orderItemId!,
                  };
                  selectRandomPhoneNumber(
                    Actions.SELECT,
                    undefined,
                    oldPhoneNumbers
                  );
                  // proceedWithSelectedNumber();
                  redirectToCheckout &&
                    redirectToCheckout(getSalesOrder(), {
                      msisdn: checkedPhoneNumber.number,
                    });
                }
              } else {
                if (checkedPhoneNumber.number.length > 0) {
                  var oldPhoneNumbers: PhoneNumbers = {
                    oldPhoneNumberId: getSalesOrder().msisdn?.msisdnId!,
                    newPhoneNumberId: checkedPhoneNumber.number,
                    orderItemId: getSalesOrder().orderItemId!,
                  };
                  selectRandomPhoneNumber(
                    Actions.SELECT,
                    undefined,
                    oldPhoneNumbers
                  );
                  // proceedWithSelectedNumber();
                  numberSelectionComplete &&
                    numberSelectionComplete(getSalesOrder(), {
                      msisdn: checkedPhoneNumber.number,
                    });
                }
              }
              /* istanbul ignore next */
              setDisabledButton(false);
            }}
            disabled={
              disabledButton &&
              (phoneNumbersPayload.data.selectPhoneNumbers.phoneNumbers[0]
                .phoneNumber.phoneNumber!.length === 0
                ? false
                : expired || checkedPhoneNumber.number.length === 0)
            }
          />,
        ]}
      />
    </View>
  );
};

export default BrowseMoreNumberScreen;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'white' },
  subContainer: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    marginTop: 24,
  },
  iosStackHeaderPadding: { marginBottom: 14 },
  grayBanner: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#F5F6F7',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    maxWidth: 869,
  },
  bannerInner: {
    flexDirection: 'row',
  },
  bannerDescriptionContainer: {
    marginLeft: 16,
  },
  grayBannerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    textAlign: 'left',
    letterSpacing: -0.2,
    lineHeight: 20,
    color: '#041333',
  },
  grayBannerDecription: {
    marginTop: 8,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    textAlign: 'left',
    lineHeight: 20,
    color: '#5E687D',
  },
  purple: { color: '#753BBD' },
  shuffleButton: { paddingHorizontal: 0 },
  number: {
    fontFamily: 'Inter-Bold',
    fontSize: 40,
    textAlign: 'left',
    letterSpacing: -0.3,
    lineHeight: 48,
    color: '#041333',
  },
  listContainer: {
    width: '100%',
    maxWidth: 869,
    marginTop: 24,
    marginBottom: 50,
  },
  selectedNumber: {
    fontSize: 40,
    marginVertical: 30,
    fontFamily: 'Inter-Medium',
    color: '#000',
  },
  scrollViewConntainerStyle: {
    flexGrow: 1,
  },
  loadingView: {
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
