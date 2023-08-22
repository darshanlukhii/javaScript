import {
    DuButton,
    DuIcon,
    DuSwitch,
    DuTextInput,
    //@ts-ignore
    DuAlertNumber,
  } from '@du-greenfield/du-ui-toolkit';
  import React, { useEffect, useState, useRef } from 'react';
  import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
  import {
    addOrderItemUnderParent,
    bssListDictionaryItems,
    bssValidateCustomerLine,
    bssValidatePhoneNumber,
    deleteOrderItem,
    getBssListProductOfferingsPortInPhoneNumber,
  } from '../../../../utils';
  import testIds, { setTestID } from '../../../../assets/support/testIds';
  import {
    checkNumberValidity,
    UpgradeToPrepaidHandler,
  } from '../../../../common/CommonFunction';
  import type { CommonType } from '../../../../components/KeepExistingSim/KeepExistingSimSheet';
  import { DuAnalyticsPlugin, DuAnalyticsTagBuilder } from '@du-greenfield/du-analytics-plugin-core';
  import DuAnalyticsFirebasePlugin from '@du-greenfield/du-firebase-analytics';
  import { getMicroAppContext, getSalesOrder, microappId } from '../../../../';
  import { useEnvironmentAbstract } from '@du-greenfield/du-abstract-environment-plugin'
  
  enum Status {
    DEFAULT = 'default',
    CONFIRM = 'confirm',
    ERROR = 'error',
  }
  enum NetworkType {
    VIRGIN = 'Virgin',
    ETISALAT = 'Etisalat',
  }
  
  type PortinVirginProps = {
    testID?: string;
    isVisible: boolean;
    onClosepress: () => void;
    onProceedToCart: () => void;
    onUseAnotherNumber: () => void;
    onPressUseDifferentEmiratesId: () => void;
    currentPhoneNumberOrderId: string;
  };
  
  /* istanbul ignore next */
  const PortinVirgin = (props: PortinVirginProps) => {
    // const PortinVirgin: FC<PortinVirginProps> = ({}) => {
    const [status, setStatus] = useState<Status>(Status.DEFAULT);
    const [networkType, setNetworkType] = useState<NetworkType>(
      NetworkType.VIRGIN
    );
    const networks = useRef({});
  
    const [focusColor, setFocusColor] = useState<string>('#C2C6CE');
    const [isESIMClicked, setIsESIMClicked] = useState(false);
    const [data, setData] = useState<CommonType>({
      isClear: false,
      isError: false,
      maxLength: 11,
      textInput: '',
    });
    const [offeringID, setOfferingID] = useState<string>('');
    const [numberStatus, setNumberStatus] = useState<any>();
    const [isVisibleAlert, setIsVisibleAlert] = useState(false);
    const env = useEnvironmentAbstract(
      [microappId],
      getMicroAppContext()?.appLanguage!,
      getMicroAppContext()?.appType
    );
  
    /* istanbul ignore next */
    useEffect(() => {
      const fn = async () => {
        try {
          const dict = await bssListDictionaryItems();
          console.log(dict, 'jbsfdajbdsfakjl');
  
          dict.bssListDictionaryItems.forEach((item: any) => {
            networks.current[item.name] = item.id;
          });
  
          console.log(networks.current, 'networks.current');
        } catch (e) {
          console.error(e);
        }
      };
  
      fn();
      fetchBssListProductOfferings();
    }, []);
  
    /* istanbul ignore next */
    const fetchBssListProductOfferings = async () => {
      const bssListProductOfferingsResponse =
        await getBssListProductOfferingsPortInPhoneNumber();
      if (bssListProductOfferingsResponse) {
        setOfferingID(
          bssListProductOfferingsResponse.bssListProductOfferings[0].id
        );
      }
    };
  
    /* istanbul ignore next */
    const fetchAddOrderItemUnderParent = async () => {
      const num = `971${data.textInput?.split(' ').join('') || ''}`
  
      const response = await addOrderItemUnderParent(
        getSalesOrder().orderItemId!,
        offeringID,
        num,
        'MSISDN ported',
        networks.current[networkType],
        'Carrier',
        isESIMClicked ? 'eSIM' : 'Physical SIM',
        'SIM Card Type'
      );
      if (response?.addOrderItemUnderParent.salesOrder.salesOrderId) {
        setStatus(Status.CONFIRM);
      }
      /* When Error Code === itf_043 show the error. (Status.ERROR) */
    };
  
    /* istanbul ignore next */
    const onConfirmPress = async () => {
      try {
        if (checkNumberValidity(data.textInput?.split(' ').join('')!)) {
          const response = await bssValidatePhoneNumber(
            'MobilePhoneNumber',
            data.textInput?.split(' ').join('')!
          );
          if (response != '200') {
            throw new Error('Invalid Number');
          }
  
          // Remove the already existing
          await deleteOrderItem({
            orderItemId: props.currentPhoneNumberOrderId,
          });
  
          fetchAddOrderItemUnderParent();
        } else {
          setNumberStatus('INVALID_VIRGIN_NUMBER');
          setIsVisibleAlert(true);
        }
      } catch (error) {
        console.log(error, 'error');
      }
    };
  
    /* istanbul ignore next */
    const onBackPress = () => setStatus(Status.DEFAULT);
  
    const onProceedToCartPress = async () => {
      props?.onProceedToCart()
      await bssValidateCustomerLine(
        '15/08/1990',
        '234-1988-23444-1',
        'EmiratesID',
        '971543571035',
        'United Arab Emirates',
        'Virgin'
      ).then((response) => {
        if (response?.bssValidateCustomerLine?.validationStatus === 'failure') {
          setNumberStatus('INVALID_EMIRATES_ID');
          setIsVisibleAlert(true);
        } else {
          props?.onClosepress();
        }
      });
    };
  
    const onPressUseDifferentEmiratesId = () => {
      setIsVisibleAlert(false);
      setStatus(Status.DEFAULT);
      props.onClosepress();
      props.onPressUseDifferentEmiratesId();
    };
  
    const onEventPress = ({ type, typeName }: { type: string, typeName: string }) => {
      let tagBuilder = new DuAnalyticsTagBuilder();
      let params = tagBuilder
        .journeyName('postpaid - consumer app')
        .subJourneyName(`postpaid only : ${data.textInput}`)
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
    const middleContainer = () => {
      switch (status) {
        case Status.DEFAULT:
          return (
            <View style={{ marginHorizontal: 32 }}>
              <DuTextInput
                title={env?.portin_enter_cusmter_number_text}
                value={data.textInput}
                onChangeText={(text) => {
                  setData(UpgradeToPrepaidHandler(text));
                }}
                onFocus={() => setFocusColor('#753BBD')}
                onBlur={() => setFocusColor('#C2C6CE')}
                //@ts-ignore
                textViewBorderColor={focusColor}
                titleStyle={{
                  fontFamily: 'Inter-Medium',
                  fontSize: 14,
                  color: '#181C24',
                }}
                contarinerStyle={{ marginBottom: 8 }}
                showClearButton={data.isClear}
                showWarning={data.isError}
                error={data.isError}
                errorMessage={
                  data.isError &&
                  (env?.not_valid_error_common_text as any)
                }
                errorMessageStyle={{
                  color: '#E4002B',
                  fontFamily: 'Inter-Medium',
                  fontSize: 13,
                }}
                maxLength={data.maxLength}
              />
  
              <Text
                style={{
                  fontFamily: 'Inter-Medium',
                  fontSize: 14,
                  color: '#3B4559',
                }}
              >
              {env?.portin_mobile_network_text}
              </Text>
              <View
                style={{ flexDirection: 'row', marginTop: 8, marginBottom: 16 }}
              >
                <DuButton
                  type={
                    networkType === NetworkType.VIRGIN ? 'primary' : 'secondary'
                  }
                  title={env?.portin_Virgint_text}
                  containerStyle={{ marginRight: 8 }}
                  buttonStyle={{
                    borderColor:
                      networkType === NetworkType.VIRGIN ? undefined : '#C2C6CE',
                  }}
                  titleStyle={{
                    color:
                      networkType === NetworkType.VIRGIN ? '#FFFFFF' : '#181C24',
                  }}
                  onPress={() => {
                    onEventPress({ type: 'button', typeName: `click – mobileNetwork Virgin` })
                    setNetworkType(NetworkType.VIRGIN)
                  }}
                />
                <DuButton
                  type={
                    networkType === NetworkType.ETISALAT ? 'primary' : 'secondary'
                  }
                  title={env?.portin_etisalat_text}
                  buttonStyle={{
                    borderColor:
                      networkType === NetworkType.ETISALAT
                        ? undefined
                        : '#C2C6CE',
                  }}
                  titleStyle={{
                    color:
                      networkType === NetworkType.ETISALAT
                        ? '#FFFFFF'
                        : '#181C24',
                  }}
                  onPress={() => {
                    onEventPress({ type: 'button', typeName: `click – mobileNetwork Etisalat` })
                    setNetworkType(NetworkType.ETISALAT)
                  }}
                />
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text
                  style={{
                    fontFamily: 'Inter-Medium',
                    fontSize: 14,
                    color: '#3B4559',
                    marginRight: 6,
                  }}
                >
                 {env?.proceed_with_esim_text}
                </Text>
                <TouchableOpacity onPress={() => {onEventPress({ type: 'button', typeName: 'proceed with esim' })}}>
                <DuIcon iconName="info" iconColor="#677084" iconSize={20} />
                </TouchableOpacity>
                <View style={{ flex: 1, alignItems: 'flex-end', marginTop: 5 }}>
                  <DuSwitch
                    {...setTestID(testIds?.KeepExistingSimSheetDuSwitch)}
                    value={isESIMClicked}
                    onValueChange={(value) => {
                      onEventPress({ type: 'button', typeName: 'proceed with esim' })
                      setIsESIMClicked(value);
                    }}
                  />
                </View>
              </View>
              <DuButton
                title={env?.confirm_common_text}
                containerStyle={{ marginTop: 10, marginBottom: 16 }}
                onPress={onConfirmPress}
              />
            </View>
          );
        case Status.CONFIRM:
          return (
            <View style={{ marginHorizontal: 32 }}>
              <Text
                style={{
                  fontFamily: 'Inter-Bold',
                  fontSize: 26,
                  textAlign: 'center',
                  marginBottom: 10,
                }}
              >
               {env?.portin_sample_mobile_number_text}
              </Text>
              <View
                style={{
                  backgroundColor: '#F5F6F7',
                  borderRadius: 12,
                  marginBottom: 30,
                }}
              >
                <Text
                  style={{
                    fontFamily: 'Inter-Medium',
                    fontSize: 14,
                    color: '#041333',
                    marginHorizontal: 16,
                    marginTop: 16,
                    marginBottom: 8,
                  }}
                >
                 {env?.portin_request_will_proceed_text}{' '}
                  <Text style={{ fontFamily: 'Inter-Bold' }}>
                   {env?.portin_x_days_text}</Text>
                    {env?.portin_connected_numbers_lost_text}
                </Text>
                <TouchableOpacity
                  style={{ marginHorizontal: 16, marginBottom: 17, width: 80 }}
                >
                  <Text
                    style={{
                      fontFamily: 'Inter-Medium',
                      fontSize: 14,
                      color: '#753BBD',
                    }}
                  >
                    {env?.learn_more_common_text}
                  </Text>
                </TouchableOpacity>
              </View>
  
              <View style={{ marginBottom: 30 }}>
                <DuButton
                  type="primary"
                  title={env?.proceed_to_cart_common_text}
                  onPress={onProceedToCartPress}
                  containerStyle={{ marginBottom: 4 }}
                />
                <DuButton type="secondary"
                title={env?.portin_use_another_number_text} />
              </View>
            </View>
          );
        case Status.ERROR:
          return (
            <View style={{ marginHorizontal: 32 }}>
              <View
                style={{
                  flexDirection: 'row',
                  backgroundColor: '#FBD5DC',
                  borderRadius: 12,
                  paddingVertical: 16,
                  marginBottom: 30,
                }}
              >
                <DuIcon
                  iconName="info"
                  iconColor="#97001D"
                  iconSize={30}
                  style={{ marginLeft: 18 }}
                />
                <Text
                  style={{
                    fontFamily: 'Inter-Medium',
                    fontSize: 14,
                    color: '#181C24',
                    marginRight: 70,
                    marginLeft: 18,
                  }}
                >
                  {env?.common_looks_like_text}{' '}
                  <Text style={{ fontFamily: 'Inter-Bold' }}>
                    {env?.portin_sample_number_text}</Text>{' '}
                 {env?.already_poidpaid_number_try_another_common_text}{' '}
                </Text>
              </View>
              <DuButton
                type="secondary"
                title={env?.try_again_with_another_number_common_text}
                containerStyle={{ marginBottom: 16 }}
                onPress={() => setStatus(Status.DEFAULT)}
              />
            </View>
          );
      }
    };
  
    if (props.isVisible) {
      return (
        <Modal animationType="fade" transparent>
          <View
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backgroundColor: '#041333',
              opacity: 0.8,
            }}
          />
          <View
            testID={props.testID}
            style={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              alignItems: 'center',
              justifyContent: 'center',
              position: 'absolute',
            }}
          >
            <View
              style={{ backgroundColor: 'white', width: 730, borderRadius: 12 }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  marginHorizontal: 32,
                  marginTop: 16,
                  marginBottom: 20,
                }}
              >
                {status === Status.CONFIRM && (
                  <TouchableOpacity onPress={onBackPress}>
                    <DuIcon iconName="left-chevron" />
                  </TouchableOpacity>
                )}
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                  <TouchableOpacity onPress={props.onClosepress}>
                    <Text
                      style={{
                        fontFamily: 'Inter-Medium',
                        color: '#753BBD',
                        fontSize: 18,
                      }}
                    >
                      {env?.close_common_text}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
  
              <View style={{ alignItems: 'center', marginBottom: 26 }}>
                <Text
                  style={{
                    fontFamily: 'Inter-Bold',
                    fontSize: 32,
                    color: '#181C24',
                  }}
                >
                  {env?.kepp_existing_number_common_text}
                </Text>
                <Text
                  style={{
                    fontFamily: 'Inter-Medium',
                    fontSize: 14,
                    color: '#3B4559',
                  }}
                >
                 {env?.existing_vergin_or_etisalat_common_text}
                </Text>
              </View>
  
              {middleContainer()}
              <DuAlertNumber
                status={numberStatus}
                testID={'DuAlertNumber'}
                isVisible={isVisibleAlert}
                onPressChooseDifferentNumber={() => {
                  setIsVisibleAlert(false);
                  setStatus(Status.DEFAULT);
                }}
                phoneNumber={data.textInput as string}
                containerStyle={styles.alertNumberStyle}
                onPressUseDifferentEmiratesId={onPressUseDifferentEmiratesId}
              />
            </View>
          </View>
        </Modal>
      );
    }
    return null;
  };
  
  export default PortinVirgin;
  
  const styles = StyleSheet.create({
    alertNumberStyle: {
      width: 520,
      borderRadius: 12,
      marginHorizontal: 8,
    },
  });

