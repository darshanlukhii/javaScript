//import liraries
import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import {
  addOrderItemUnderParent,
  bssValidateCustomerLine,
  bssValidatePhoneNumber,
  getBssListProductOfferingsPortInPhoneNumber,
} from '../../../../utils';
import {
  checkNumberValidity,
  UpgradeToPrepaidHandler,
} from '../../../../common/CommonFunction';
import type { CommonType } from '../../../../components/KeepExistingSim/KeepExistingSimSheet';
//@ts-ignore
import { DuAlertNumber, DuButton, DuIcon, DuTextInput } from '@du-greenfield/du-ui-toolkit';
import DuAnalyticsFirebasePlugin from '@du-greenfield/du-firebase-analytics';
import { DuAnalyticsPlugin, DuAnalyticsTagBuilder } from '@du-greenfield/du-analytics-plugin-core';
import { getMicroAppContext, getSalesOrder, microappId } from '../../../../';
import { useEnvironmentAbstract } from '@du-greenfield/du-abstract-environment-plugin'

type UpgradeVirginProps = {
  testID?: string;
  isVisible: boolean;
  onClosepress: () => void;
  onProceedToCart: () => void;
  onUseAnotherNumber: () => void;
  onPressUseDifferentEmiratesId: () => void;
};

enum Status {
  DEFAULT = 'default',
  CONFIRM = 'confirm',
  ERROR = 'error',
}

enum NetworkType {
  PORTIN = 'portin',
}

/* istanbul ignore next */
const UpgradeVirgin = (props: UpgradeVirginProps) => {
  // const UpgradeVirgin: FC<UpgradeVirginProps> = () => {
  const [status, setStatus] = useState<Status>(Status.DEFAULT);
  const [focusColor, setFocusColor] = useState<string>('#C2C6CE');
  const [data, setData] = useState<CommonType>({
    isClear: false,
    isError: false,
    maxLength: 11,
    textInput: '',
  });
  const [offeringID, setOfferingID] = useState<string>('');
  const [networkType, _setNetworkType] = useState<NetworkType>(
    NetworkType.PORTIN
  );
  const [isESIMClicked, _setIsESIMClicked] = useState(false);
  const [numberStatus, setNumberStatus] = useState<any>();
  const [isVisibleAlert, setIsVisibleAlert] = useState(false);
  const env = useEnvironmentAbstract(
    [microappId],
    getMicroAppContext()?.appLanguage!,
    getMicroAppContext()?.appType
  );

  useEffect(() => {
    fetchBssListProductOfferings();
  }, []);

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
    const response = await addOrderItemUnderParent(
      getSalesOrder().orderItemId!,
      offeringID,
      data.textInput?.split(' ').join('')!,
      'MSISDN ported',
      networkType,
      'Carrier',
      isESIMClicked ? 'eSIM' : 'Physical SIM',
      'SIM Card Type'
    );
    if (response?.addOrderItemUnderParent.salesOrder.salesOrderId) {
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
          setStatus(Status.CONFIRM);
        }
      });
    } else {
      setStatus(Status.ERROR);
    }
  };

  /* istanbul ignore next */
  const onConfirmPress = async () => {
    if (checkNumberValidity(data.textInput?.split(' ').join('')!)) {
      const response = await bssValidatePhoneNumber(
        'MobilePhoneNumber',
        data.textInput?.split(' ').join('')!
      );
      if (response == '200') {
        fetchAddOrderItemUnderParent();
      }
    } else {
      setNumberStatus('INVALID_PREPAID_NUMBER');
      setIsVisibleAlert(true);
    }
  };

  const onAnalytics = () => {
    let tagBuilder = new DuAnalyticsTagBuilder();
    let analytics: DuAnalyticsPlugin = new DuAnalyticsFirebasePlugin();
    let params = tagBuilder
      .journeyName('postpaid - dealer app')
      .subJourneyName('postpaid + device : new number')
      .screenName('DIP - upgrade plan')
      .planId(getSalesOrder().product.id.toLowerCase())
      .planName(getSalesOrder().product.name.toLowerCase())
      .build()
    analytics.logEvent('upgrade_prepaid__to_postpaid', params);     
  }

  const onError = () => {
    let tagBuilder = new DuAnalyticsTagBuilder();
    let analytics: DuAnalyticsPlugin = new DuAnalyticsFirebasePlugin();
    let params = tagBuilder
      .journeyName('postpaid - dealer app')
      .subJourneyName('postpaid + device : new number')
      .screenName('DIP - upgrade plan')
      .errorName('upgrade to postpaid error')
      .errorType('Plan error')
      .errorMessage('Not a prepaid number. Please check and try again')
      .build()
    analytics.logEvent('error_occured', params); 
  }

  /* istanbul ignore next */
  const onBackPress = () => setStatus(Status.DEFAULT);

  /* istanbul ignore next */
  const onPressUseDifferentEmiratesId = () => {
    setIsVisibleAlert(false);
    setStatus(Status.DEFAULT);
    props.onClosepress();
    props.onPressUseDifferentEmiratesId();
  };

  const middleContainer = () => {
    switch (status) {
      case Status.DEFAULT:
        return (
          <View style={{ marginHorizontal: 32 }}>
            <DuTextInput
              testID="customerPrepaidNumber"
              title={env?.enter_customer_prepaid_common_text}
              value={data.textInput}
              onChangeText={(text) => {
                setData(UpgradeToPrepaidHandler(text));
                data?.isError && onError()
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
            <DuButton
              testID="onConfirmPress"
              title={env?.confirm_common_text}
              containerStyle={{ marginTop: 10, marginBottom: 16 }}
              onPress={() => {
                onAnalytics()
                onConfirmPress()
              }}
            />
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
                 {env?.upgrade_sample_number_text}</Text>{' '}
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
      default:
        return;
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
                <TouchableOpacity onPress={onBackPress} testID="onBackPress">
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
              {env?.upgrade_to_postpaid_common_text}
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

//make this component available to the app
export default UpgradeVirgin;

const styles = StyleSheet.create({
  alertNumberStyle: {
    width: 520,
    borderRadius: 12,
    marginHorizontal: 8,
  },
});
