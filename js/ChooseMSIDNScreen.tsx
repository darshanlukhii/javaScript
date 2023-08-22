import {
    DuButton,
    DuButtonsDock,
    DuDialog,
    DuDivider,
    DuHeader,
    DuHeaderProps,
    DuIcon,
    DuListItemStatic,
    DuOverlay,
    DuSheet,
  } from '@du-greenfield/du-ui-toolkit';
  import type { NativeStackScreenProps } from '@react-navigation/native-stack';
  import React, { FC, useEffect, useState } from 'react';
  import {
    FlatList,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
  } from 'react-native';
  import { useDispatch, useSelector } from 'react-redux';
  import {
    Actions,
    PhoneNumbers,
    SelectPhoneNumberInput,
    SelectPhoneNumbers,
  } from '../../../utils/gql/models';
  import NumberInput from '../../../components/NumberInput';
  import type { CustomerNavigatorParamList } from '../../../navigator';
  import { getStatusBar } from '../BAUNumberPrepaid/BAUNumberPrepaid';
  import { keyExtractor } from '../PermissionScreen/RetriveFunctions';
  import { getMicroAppContext, getSalesOrder, microappId, setSalesOrder } from '../../../';
  import { loadAsyncStorage } from '@du-greenfield/du-env-abstraction-plugin';
  import { selectPhoneNumbers } from '../../../utils';
  import {
    phoneNumberSelected,
    setNumberinputFocus,
  } from '../../../redux/features/phoneNumbersSlice';
  import testIds, { setTestID } from '../../../assets/support/testIds';
  import type { Order } from '@du-greenfield/du-commons';
  import { setsalesOrder } from '../../../redux/features/configSlice';
  import { DuAnalyticsPlugin, DuAnalyticsTagBuilder } from '@du-greenfield/du-analytics-plugin-core';
  import DuAnalyticsFirebasePlugin from '@du-greenfield/du-firebase-analytics';
  import { useEnvironmentAbstract } from '@du-greenfield/du-abstract-environment-plugin'
  type ChooseMSIDNScreenProps = NativeStackScreenProps<
    CustomerNavigatorParamList,
    'ChooseMSIDNScreen'
  > & {
    navigateToShipping: (isFromCheckOut?: boolean) => void;
    mockphoneNumbersPayload?: any;
  };
  
  type CheckedPhoneNumberType = {
    id: string;
    number: string;
  };
  
  const ChooseMSIDNScreen: FC<ChooseMSIDNScreenProps> = ({
    navigation,
    navigateToShipping,
    mockphoneNumbersPayload,
  }) => {
    const timeout = undefined;
    const [overlayVisibility, setOverlayVisibility] = useState<boolean>(false);
    const [seconds, setSeconds] = useState<number | undefined>(timeout);
    const [expired, setExpired] = useState<boolean>(false);
    const [showSheet, setShowSheet] = useState<boolean>(false);
    const [checkedPhoneNumber, setCheckedPhoneNumber] = useState<CheckedPhoneNumberType>({ id: '100', number: '0553286199' });
    const localizationData = useSelector((state: any) => state.phoneNumberSlice);
    const { specificNumber, isPhoneNumberInputFocus } = localizationData;
    const [phoneNumbersPayload, setPhoneNumbersPayload] = useState<SelectPhoneNumbers | undefined>(mockphoneNumbersPayload);
    const [isFromCheckOut, setIsFromChekout] = useState<boolean | undefined>(false);
    const [disabledBtn, setDisabledBtn] = useState<boolean>(false);
    const [isAvailablelSearchNumber, setIsAvailablelSearchNumber] = useState<boolean>(true);
    const [isAvailablelSpecialNumber, setIsAvailablelSpecialNumber] = useState<boolean>(false);
    const [phoneNumbers, setPhoneNumbers] = useState<any | undefined>();
    const [isLoading, setLoading] = useState<boolean>(true)
    const env = useEnvironmentAbstract(
      [microappId],
      getMicroAppContext()?.appLanguage!,
      getMicroAppContext()?.appType
    );
    let idArray: Array<string> = [];
    const dispatch = useDispatch();
  
    const DuHeaderpops: DuHeaderProps = {
      //@ts-ignore
      leftButtonTestID: 'DH_TEST',
      safeArea: true,
      left: 'tertiary',
      leftTertiaryText: env?.close_common_text,
      leftPressed: () => {
        /* istanbul ignore next */
        navigation.navigate("BAUNumberPrepaid")
      },
      title: env?.browse_numbers_common_text,
      statusBar: getStatusBar(Platform.OS),
    };
  
    /* istanbul ignore next */
    const renderSpecificTitle = (params: string) => {
      let stringPriorToSelected = '';
      let stringAfterSelected = '';
      let slectedString: string = '';
  
      const searchParam = params.slice(4, 12).replace(/ /g, '');
      if (specificNumber.length > 0) {
        const breakPoint = searchParam.search(specificNumber);
  
        if (breakPoint > 0) {
          stringPriorToSelected = searchParam.slice(0, breakPoint);
        }
  
        slectedString = searchParam.slice(
          breakPoint,
          breakPoint + specificNumber.length
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
        <View style={{ flexDirection: 'row', flex: 1 }}
          {...setTestID(`${testIds.ChooseMSIDNScreenV2MainView}_`)}>
          <Text
            style={{
              fontSize: 16,
              color: '#181C24',
              fontFamily: 'Inter-Regular',
            }}
            {...setTestID(`${testIds.ChooseMSIDNScreenV2paramtext}_`)}
          >
            {params.slice(0, 3) + ' ' + stringPriorToSelected}
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: '#181C24',
              fontFamily: 'Inter-Bold',
            }}
            {...setTestID(`${testIds.ChooseMSIDNScreenV2slectedString}_`)}
          >
            {slectedString}
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: '#181C24',
              fontFamily: 'Inter-Regular',
            }}
            {...setTestID(`${testIds.ChooseMSIDNScreenV2stringAfterSelected}_`)}
          >
            {stringAfterSelected}
          </Text>
        </View>
      );
    };
  
    /* istanbul ignore next */
    const renderTitle = (params: string) => {
      return (
        <View style={{ flexDirection: 'row', flex: 1 }}
          {...setTestID(`${testIds.ChooseMSIDNScreenV2renderTitleView}_${params ?? "_"}`)}>
          <Text
            {...setTestID(`${testIds.ChooseMSIDNScreenV2renderTitleText}_${params ?? "_"}`)}
            style={{
              fontSize: 16,
              color: '#181C24',
              fontFamily: 'Inter-Bold',
            }}
          >
            {getFormattedNumber(params)}
          </Text>
        </View>
      );
    };
  
    useEffect(() => {
      const intervalId = setInterval(() => {
        setSeconds((prevSeconds) => {
          if (prevSeconds === 0) {
            clearInterval(intervalId);
            return 0;
          } else {
            return prevSeconds! - 1;
          }
        });
      }, 1000);
  
      return () => clearInterval(intervalId);
    }, [seconds]);
  
    useEffect(() => {
      if (seconds === 0) {
        refreshNumbers()
      }
    }, [seconds]);
  
    const minutesDisplay = Math.floor(seconds! / 60);
    const secondsDisplay = seconds! % 60;
  
    const formattedMinutes = String(minutesDisplay).padStart(2, '0');
    const formattedSeconds = String(secondsDisplay).padStart(2, '0');
    /* istanbul ignore next */
    const renderNumberRow = ({ item, index }: any) => {
      const isEnd = index === phoneNumbersPayload!.data.selectPhoneNumbers.phoneNumbers.length - 1;
      return (
        <TouchableOpacity
          onPress={() => handleNumberSelection(item.phoneNumber.id)}
          {...setTestID(`${testIds.ChooseMSIDNScreenV2renderNumberRowTouchableOpacity}_${index ?? "_"}`)}
        >
          <DuListItemStatic
            {...setTestID(`${testIds.ChooseMSIDNScreenV2renderNumberRowuListItemStatic}_${index ?? "_"}`)}
            bottomDivider={!isEnd}
            checkListType={'radio'}
            //@ts-ignore
            isSpecificTitle={true}
            specificTitle={
              isAvailablelSpecialNumber && specificNumber.length > 2
                ? renderSpecificTitle(item.phoneNumber.phoneNumber)
                : renderTitle(item.phoneNumber.phoneNumber)
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
              checkedPhoneNumber.number === item.phoneNumber.phoneNumber
                ? true
                : false
            }
          />
        </TouchableOpacity>
      );
    };
  
    /* istanbul ignore next */
    useEffect(() => {
      dispatch(setNumberinputFocus(false));
      setIsFromChekout(getMicroAppContext()?.flags?.fromChekout);
      selectRandomPhoneNumber(Actions.BROWSE, 5);
    }, []);
  
    /* istanbul ignore next */
    const getCustomerID = (): string => {
      if (getMicroAppContext().customer?.type === "loggedin") {
        return getMicroAppContext().meData?.data.me[0].id!;
      } else {
        return getSalesOrder().customer.id
      }
    }
  
    /* istanbul ignore next */
    async function selectRandomPhoneNumber(action: Actions, qty?: number, oldPhoneNumbers?: PhoneNumbers, mask?: string) {
      idArray = await loadAsyncStorage('vip-id-array');
      let requestInput: SelectPhoneNumberInput = {
        action: action,
        quantity: qty,
        salesOrderId: getSalesOrder().salesOrderId,
        customerId: getCustomerID(),
        productOfferingId: !mask ? getSalesOrder().productOffering?.numberOfferingId : undefined,
        parentOrderItemId: !mask ? getSalesOrder().orderItemId! : undefined,
        vipCategoryIds: oldPhoneNumbers || idArray === null || idArray.some(i => i === null) ? undefined : idArray,
        phoneNumbers: oldPhoneNumbers,
        mask: mask && mask
      };
      const response = await selectPhoneNumbers(requestInput);
      if (action !== Actions.SELECT && response?.data.selectPhoneNumbers) {
        setPhoneNumbersPayload(response);
        checkAvailability(response);
        setSeconds(parseInt(response.data.selectPhoneNumbers.lockPeriod?.value!) * 60)
        setPhoneNumbers(response.data.selectPhoneNumbers.phoneNumbers);
        setShowSheet(response.data.selectPhoneNumbers.phoneNumbers.length <= 0 || response.data.selectPhoneNumbers.phoneNumbers == null);
        setCheckedPhoneNumber({
          id: response.data.selectPhoneNumbers.phoneNumbers[0].phoneNumber.id!,
          number: response.data.selectPhoneNumbers.phoneNumbers[0].phoneNumber.phoneNumber!
        });
      } else if (response?.code === 500 && response.errors.some(i => i.code === "itf_017")) {
        setIsAvailablelSearchNumber(false);
        setPhoneNumbersPayload(undefined)
        setLoading(false)
      } else {
        const salesOrder: Order = {
          ...getSalesOrder(), msisdn: {
            ...getSalesOrder().msisdn,
            msisdn: response!.data.selectPhoneNumbers.phoneNumbers[0].phoneNumber.phoneNumber!,
            msisdnId: response!.data.selectPhoneNumbers.phoneNumbers[0].phoneNumber.id!,
            orderItemID: response!.data.selectPhoneNumbers.phoneNumbers[0].orderItemId!
          }
        };
        setSalesOrder(salesOrder);
        dispatch(setsalesOrder(getSalesOrder()))
        dispatch(phoneNumberSelected({ phoneNumber: response?.data.selectPhoneNumbers.phoneNumbers[0].phoneNumber.phoneNumber }));
        navigateToShipping && navigateToShipping(isFromCheckOut);
        setLoading(false)
      }
    }
  
    /* istanbul ignore next */
    const getFormattedNumber = (phoneNumber: string): string => {
      const firstThreeDigits = phoneNumber.substring(0, 3);
      let formattedPhoneNumber = phoneNumber;
  
      if (firstThreeDigits === '971') {
        formattedPhoneNumber = `0${phoneNumber.substring(3)}`;
      }
      return formattedPhoneNumber;
    };
  
    /* istanbul ignore next */
    function refreshNumbers() {
      setExpired(false);
      setSeconds(timeout);
      selectRandomPhoneNumber(Actions.BROWSE, 5);
    }
  
    /* istanbul ignore next */
    function handleNumberSelection(id: string) {
      for (let number of phoneNumbersPayload?.data.selectPhoneNumbers.phoneNumbers!) {
        if (id === number.phoneNumber.id) {
          setCheckedPhoneNumber({ number: number.phoneNumber.phoneNumber!, id: number.phoneNumber.id });
        }
      }
    }
  
    /* istanbul ignore next */
    function onShufflePress() {
      setExpired(false);
      setSeconds(timeout);
      selectRandomPhoneNumber(Actions.BROWSE, 5);
    }
  
    /* istanbul ignore next */
    const logAddToCart = () => {
      let tagBuilder = new DuAnalyticsTagBuilder();
  
      let item = tagBuilder
        .itemId(getSalesOrder().product.id.toLowerCase())
        .itemName(getSalesOrder().product.name.toLowerCase())
        .itemBrand('du')
        .itemCategory4(`${getSalesOrder().product.plan.data} gb`)
        .itemCategory5(`${getSalesOrder().product.plan.duration} months`)
        .price(getSalesOrder().product.plan.price.amount)
        .quantity(1)
        .build()
  
      let params = {
        journey_name: 'postpaid - consumer app',
        sub_journey_name: `postpaid only : ${checkedPhoneNumber.number}`,
        currency: 'aed',
        value: getSalesOrder().product.plan.price.amount,
        items: [item]
      }
      let analytics: DuAnalyticsPlugin = new DuAnalyticsFirebasePlugin();
      analytics.logEvent('add_to_cart', params);
    }
  
    /* istanbul ignore next */
    const onBottomBtnPress = () => {
      setDisabledBtn(true);
      if (checkedPhoneNumber.number.length > 0) {
        if (phoneNumbersPayload) {
          var oldPhoneNumbers: PhoneNumbers = {
            oldPhoneNumberId: getSalesOrder().msisdn?.msisdnId!,
            newPhoneNumberId: checkedPhoneNumber.id,
            orderItemId: getSalesOrder().msisdn?.orderItemID!,
          };
          logAddToCart()
          selectRandomPhoneNumber(Actions.SELECT, undefined, oldPhoneNumbers);
        }
      }
      setDisabledBtn(false);
    }
  
    /* istanbul ignore next */
    function onOverlayBackdropPress() {
      setOverlayVisibility(false);
    }
  
    /* istanbul ignore next */
    function onDialogPrimaryPress() {
      setOverlayVisibility(false);
    }
  
    /* istanbul ignore next */
    const checkAvailability = (phoneNumbersPayload: SelectPhoneNumbers) => {
      let filteredData =
        phoneNumbersPayload?.data.selectPhoneNumbers?.phoneNumbers?.filter((x: any) =>
          x.phoneNumber.phoneNumber.replace(/ /g, '').includes(specificNumber)
        );
  
      if (filteredData?.length! > 0) {
        setIsAvailablelSearchNumber(true);
        setIsAvailablelSpecialNumber(true);
        setPhoneNumbers(filteredData);
      } else {
        setIsAvailablelSpecialNumber(false);
        setIsAvailablelSearchNumber(false);
      }
      setLoading(false)
    };
  
    /* istanbul ignore next */
    const onChangeText = (text: string) => {
      if (text.length >= 3 || text === "") {
        setLoading(true);
        selectRandomPhoneNumber(Actions.BROWSE, 5, undefined, text === "" ? undefined : "%9715" + text + "%")
      }
    }
  
    return (
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        <DuHeader
          {...setTestID(testIds?.ChooseMSIDNScreenDuHeader)}
          {...DuHeaderpops}
        />
  
        <View style={{ height: 80, marginHorizontal: 40 }}>
          <NumberInput {...setTestID(`${testIds?.ChooseMSIDNScreenMain}_${"numberInput"}`)} containerStyle={{ marginLeft: 10 }} onChangeText={onChangeText} />
        </View>
        <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
          <DuDivider color={isPhoneNumberInputFocus ? '#753BBD' : '#E1E2E6'}
            {...setTestID(`${testIds.ChooseMSIDNScreenV2DuDivider}_`)} />
        </View>
        <View
          style={{
            alignItems: 'center',
            paddingHorizontal: 16,
            marginBottom: 16,
          }}
          {...setTestID(`${testIds.ChooseMSIDNScreenV2EnterView}_`)}
        >
          <Text
            style={{
              fontSize: 13,
              color: '#677084',
              textAlign: 'center',
              fontFamily: 'Moderat-Regular',
              lineHeight: 20,
              flexGrow: 1,
              width: 311,
            }}
            {...setTestID(`${testIds.ChooseMSIDNScreenV2EnterText}_`)}
          >
            {env?.choose_msdn_enter_3digits_text}
          </Text>
        </View>
  
        {!isLoading ? (
          <View style={{ flex: 1 }}>
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'space-between',
                marginVertical: 16,
                marginHorizontal: 16,
                padding: 16,
                backgroundColor: '#F6F6F8',
                borderRadius: 12,
                flexDirection: 'row',
              }}
              {...setTestID(`${testIds.ChooseMSIDNScreenV2NumbershaveView}_`)}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 16,
  
                    color: '#181C24',
                    lineHeight: 20,
                    fontFamily: 'Inter-Bold',
                  }}
                  {...setTestID(`${testIds.ChooseMSIDNScreenV2NumbershaveText}_`)}
                >
                  {expired ? `${env?.numbers_have_expired_common_text}`: `${env?.choose_msdn_number_reserved}` + formattedMinutes + ':' + formattedSeconds}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    marginTop: 8,
                    color: '#3B4559',
                    lineHeight: 20,
                    fontFamily: 'Inter-Regular',
                  }}
                  {...setTestID(`${testIds.ChooseMSIDNScreenV2NumbersexpiredText}_`)}
                >
                  {expired? `${env?.have_expired_shuffle_get_new_common_text}`: `${env?.choose_msdn_pick_new_text}`}
                </Text>
              </View>
              <DuButton
                {...setTestID(testIds?.ChooseMSIDNScreenDuButton1)}
                type="teritary"
                title={env?.shuffle_common_text}
                containerStyle={{
                  width: 90,
                }}
                titleStyle={{ fontSize: 14, fontFamily: 'Inter-Medium' }}
                size="small"
                icon={{ iconName: 'refresh' }}
                iconContainerStyle={{ marginRight: -3 }}
                onPress={onShufflePress}
              />
            </View>
  
            {phoneNumbersPayload?.data.selectPhoneNumbers?.phoneNumbers?.length! <= 0 ||
              phoneNumbersPayload?.data.selectPhoneNumbers?.phoneNumbers == null ||
              isAvailablelSearchNumber == false ? (
              <View
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingHorizontal: 20,
                }}
                {...setTestID(`${testIds.ChooseMSIDNScreenV2phoneNumbersPayloadView}_`)}
              >
                <DuIcon
                  style={{ marginTop: 8 }}
                  iconName={'info'}
                  artWorkHeight={40}
                  artWorkWidth={40}
                  iconColor={'#F5C311'}
                  {...setTestID(`${testIds.ChooseMSIDNScreenV2phoneNumbersPayloadDuIcon}_`)}
                />
                <View style={styles.NoResultCardTitleWrapper}>
                  <Text style={styles.NoResultCardTitle}
                    {...setTestID(`${testIds.ChooseMSIDNScreenV2phoneNumbersPayloadText}_`)}>
                      {env?.no_results_found_common_text}</Text>
                </View>
                <View style={styles.NoResultCardDescriptionWrapper}>
                  <Text style={styles.NoResultCardDescription}
                    {...setTestID(`${testIds.ChooseMSIDNScreenV2searchingText}_`)}>
                   {env?.choose_msdn_try_seraching_text}
                  </Text>
                </View>
                <DuButton
                  {...setTestID(testIds?.ChooseMSIDNScreenBrowseNumbersBtn)}
                  type="secondary"
                  title={env?.browse_numbers_common_text}
                  size="small"
                  onPress={() => {
                    //TD: call browse numbers function
                  }}
                />
                <View style={{ height: 20 }} />
              </View>
            ) : (
              <View style={{ marginTop: 16, flex: 1 }}>
                <FlatList
                  {...setTestID(`${testIds.ChooseMSIDNScreenV2FlatList}_`)}
                  data={phoneNumbers}
                  renderItem={renderNumberRow}
                  keyExtractor={keyExtractor}
                />
              </View>
            )}
          </View>
        ) : (
          <View
            style={{
              flex: 1,
              backgroundColor: 'white',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text
              {...setTestID(`${testIds.ChooseMSIDNScreenV2phoneNumbersPayload}_`)}>
                {env?.common_loading_text}</Text>
          </View>
        )}
  
        {/* <FlatList
          data={phoneNumbersPayload!.phoneNumbers}
          renderItem={renderNumberRow}
          keyExtractor={keyExtractor}
        /> */}
  
        <DuButtonsDock
          {...setTestID(testIds?.ChooseMSIDNScreenDuButtonsDock)}
          shadow={true}
          items={[
            <View>
              <Text
                style={{
                  fontSize: 14,
                  color: '#3B4559',
                  fontFamily: 'Inter-Regular',
                  lineHeight: 20,
                  marginBottom: 2,
                }}
                {...setTestID(`${testIds.ChooseMSIDNScreenV2DuButtonsDockYourNuew}_`)}
              >
               {env?.choose_msdn_new_number_title}
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  color: '#27143F',
                  fontFamily: 'Inter-Bold',
                  lineHeight: 20,
                  marginBottom: 10,
                }}
                {...setTestID(`${testIds.ChooseMSIDNScreenV2checkedPhoneNumber}_`)}
              >
                {checkedPhoneNumber.number}
              </Text>
            </View>,
            <View>
              <DuButton
                {...setTestID(testIds?.ChooseMSIDNScreenDuButton2)}
                title={isFromCheckOut ? `${env?.select_this_number_common_text}`:`${env?.proceed_to_cart_common_text}`}
                type="primary"
                disabled={
                  expired || checkedPhoneNumber.number.length === 0 ? true : disabledBtn || isLoading
                }
                onPress={onBottomBtnPress}
              />
            </View>,
          ]}
        />
  
        <DuSheet
          {...setTestID(testIds?.ChooseMSIDNScreenDuSheet)}
          isVisible={showSheet}
          onClose={
            /* istanbul ignore next */
            () => setShowSheet(false)
          }
          standard={{
            title: env?.numbers_not_available_common_text,
            body: env?.numbers_not_available_try_later_commmon_text,
            icon: {
              iconName: 'search-off',
              iconColor: '#BA0023',
              artWorkHeight: 36,
              artWorkWidth: 36,
            },
            //@ts-ignore
            upperText: '',
            buttons: [
              {
                text: env?.common_try_again_text,
                type: 'primary',
                onPress:
                  /* istanbul ignore next */
                  () => {
                    setShowSheet(false);
                    refreshNumbers();
                  },
              },
            ],
          }}
        />
  
        <DuOverlay
          {...setTestID(testIds?.ChooseMSIDNScreenDuOverlay)}
          isVisible={overlayVisibility}
          overlayStyle={{
            paddingHorizontal: 16,
            backgroundColor: 'transparent',
            elevation: 0,
          }}
          onBackdropPress={onOverlayBackdropPress}
        >
          <DuDialog
            {...setTestID(testIds?.ChooseMSIDNScreenDuDialog)}
            headline={' '}
            body={' '}
            primaryText={env?.common_ok_text}
            icon={{
              artWorkWidth: 29,
              artWorkHeight: 26,
              iconName: 'warning',
              iconColor: '#F5C311',
            }}
            pressedPrimary={onDialogPrimaryPress}
          />
        </DuOverlay>
      </View>
    );
  };
  
  const styles = StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: 'white',
      paddingTop: 4,
    },
    NoResultCardDescriptionWrapper: {
      alignContent: 'center',
      paddingTop: 6,
      paddingBottom: 24,
    },
    NoResultCardDescription: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: '#3B4559',
      alignItems: 'center',
      textAlign: 'center',
      display: 'flex',
      fontStyle: 'normal',
      lineHeight: 20,
    },
    NoResultCardTitleWrapper: {
      paddingTop: 15,
    },
    NoResultCardTitle: {
      fontSize: 22,
      fontFamily: 'Inter-Bold',
      color: '#181C24',
      lineHeight: 26,
      letterSpacing: -0.3,
    },
  });
  
  export default ChooseMSIDNScreen;
  