/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import {
  DuIcon,
  DuButton,
  DuText,
  DuTextInput,
  DuButtonGroup,
  DuEditorialProps,
  DuEditorial,
  DuCheckBox,
  DuSwitch,
  DuBanner,
} from '@du-greenfield/du-ui-toolkit';
import { getSalesOrder } from '../../';
import { bssValidatePhoneNumber } from '../../utils';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import testIds, { setTestID } from '../../assets/support/testIds';
import AlertComponent from '../AlertComponent';
import {
  checkNumberValidity,
  UpgradeToPrepaidHandler,
} from '../../common/CommonFunction';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  DuAnalyticsPlugin,
  DuAnalyticsTagBuilder,
} from '@du-greenfield/du-analytics-plugin-core';
import DuAnalyticsFirebasePlugin from '@du-greenfield/du-firebase-analytics';
import { useEnvironmentAbstract } from '@du-greenfield/du-abstract-environment-plugin';
import { getMicroAppContext, microappId } from '../../';
import { useDispatch } from 'react-redux';
import { setkeepExistingBottomSheetVisibleBoolean } from '../../redux/features/configSlice';
// import {
//   DuAnalyticsPlugin,
//   DuAnalyticsTagBuilder,
// } from '@du-greenfield/du-analytics-plugin-core';
// import DuAnalyticsFirebasePlugin from '@du-greenfield/du-firebase-analytics';

export type CommonType = {
  isClear: boolean;
  isError: boolean;
  maxLength?: number;
  textInput?: string;
};

export enum AlertStatus {
  INVALID_VIRGIN_NUMBER,
  INVALID_PREPAID_NUMBER,
}

type KeepExistingSimSheetProps = {
  closeButtonClicked: () => void;
  navigateToShipping: () => void;
  selectedIndex?: (index: number) => void;
  addExistingOrder: (
    bssListProductOfferingAPI: any,
    phoneNumber: any,
    characteristicsName: string,
    carrier: string,
    portNumber?: string
  ) => void;
  navigateToCartHandler: (
    typeState: number,
    msisdn: string,
    isTOSChecked: boolean,
    isESIMClicked: boolean,
    productOfferingId?: any
  ) => void;
  deleteOrderItem: () => Promise<void>;
};

const KeepExistingSimSheetBody: React.FC<KeepExistingSimSheetProps> = ({
  closeButtonClicked,
  navigateToCartHandler,
  addExistingOrder,
  selectedIndex,
  deleteOrderItem,
}) => {
  const dispatch = useDispatch();
  const [isTOSChecked, setIsTOSChecked] = useState(true);
  const [isESIMClicked, setIsESIMClicked] = useState(true);
  const [msisdn, setMsisdn] = useState('');
  const [isVisibleAlert, setIsVisibleAlert] = useState(false);
  const [status, setStatus] = useState<any>();
  const [isValidPrepaidNumber, setIsValidPrepaidNumber] = useState(false);

  const [standardIndex, setSelectedStandardIndex] = useState<number>(0);
  const [data, setData] = useState<CommonType>({
    isClear: false,
    isError: false,
    maxLength: 11,
    textInput: '',
  });
  const env = useEnvironmentAbstract(
    [microappId],
    getMicroAppContext()?.appLanguage!,
    getMicroAppContext()?.appType
  );
  const existingNetworks = [
    { key: 0, value: env?.virgin_text, selected: true },
    { key: 1, value: env?.etisalat_text, selected: false },
  ];
  /* istanbul ignore next */
  // useEffect(() => {
  //   return () => {
  //     console.log("set msisdn number -----------------", data?.textInput?.trim()!);
  //     setMsisdn(data?.textInput?.trim()!);

  //   };
  // }, [data.textInput!]);

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
  const handleButtonGroupTap = (key: number) => {
    onEventPress({ type: 'button', typeName: `click – mobileNetwork ${standardIndex == 0 ? 'Virgin' : 'Etisalat'} ` })
    setSelectedStandardIndex(key);
    selectedIndex && selectedIndex(key);
  };

  const logAddToCart = () => {
    let tagBuilder = new DuAnalyticsTagBuilder();
    let item = tagBuilder
    .itemId('refresh_1-2xyzz7v_12_national')
    .itemName('power plan unlimited national data 1000')
    .itemListId('list id of plan')
    .itemListName('plan listing page')
    .index(1)
    .itemBrand('du')
    .itemCategory('postpaid plans')
    .itemCategory2('national + 12')
    .itemCategory3('p-sim/e-sim')
    .itemCategory4('n:unilimited|r:40 gb')
    .itemCategory5('12 months')
    .itemVariant('national + 12')
    .discount(0)
    .price(1000)
    .quantity(1)
    .build()

    let params = {
      journey_name:'postpaid - dealer app',
      sub_journey_name:`postpaid only : new number`,
      currency:'AED',
      value:1000,
      items:[item]
    }
    let analytics: DuAnalyticsPlugin = new DuAnalyticsFirebasePlugin();
    analytics.logEvent('add_to_cart', params);
  };

  /* istanbul ignore next */
  const checkPortIn = async () => {
    if (!checkNumberValidity(msisdn) && standardIndex === 0) {
      closeButtonClicked && closeButtonClicked();
      setStatus(AlertStatus.INVALID_VIRGIN_NUMBER);
      setIsVisibleAlert(true);
    } else if (!checkNumberValidity(msisdn) && standardIndex === 1) {
      closeButtonClicked && closeButtonClicked();
      setStatus(AlertStatus.INVALID_PREPAID_NUMBER);
      setIsVisibleAlert(true);
    } else {
      const response = await bssValidatePhoneNumber(
        'MobilePhoneNumber',
        msisdn.toString().replace(' ', '')
      );
      console.log('bssValidatePhoneNumber :::', response);
      if (response?.code === 200) {
        await deleteOrderItem();
        const res = addExistingOrder(
          msisdn,
          'Virgin',
          standardIndex === 0 ? 'Virgin' : 'Etisalat',
          'du'
        );
        closeButtonClicked();
        navigateToCartHandler &&
          navigateToCartHandler(
            standardIndex,
            msisdn,
            !isTOSChecked,
            !isESIMClicked,
            res
          );
      } else if (
        response?.data?.errors[0]?.code == 'itf_043' &&
        response?.code == 500
      ) {
        setIsValidPrepaidNumber(true);
        dispatch(setkeepExistingBottomSheetVisibleBoolean(true));
      } else {
        closeButtonClicked && closeButtonClicked();
        setStatus(AlertStatus.INVALID_PREPAID_NUMBER);
        setIsVisibleAlert(true);
      }
      logAddToCart();
    }
  };

  /* istanbul ignore next */
  const props: DuEditorialProps = {
    title: env?.succesful_port_in_text,
    titleStyle: {
      fontFamily: 'Inter-Bold',
      fontSize: 16,
      lineHeight: 20,
      letterSpacing: -0.2,
    },
    // containerStyle:{padding: 16},,
    bulletPointContainerStyle: { paddingRight: 16 },
    bulletPoints: [
      <DuText style={styles.subheading}>
        {env?.no_outstanding_bills_text}{' '}
      </DuText>,
      <DuText style={styles.subheading}>{env?.emirates_id_linked_text}</DuText>,
    ],
  };

  /* istanbul ignore next */
  const upgradeToPrepaidHandler = (text: any) => {
    setData(UpgradeToPrepaidHandler(text));
    setMsisdn(text);
  };
 /* istanbul ignore next */
  const handleKeepExistingBottomSheetVisibleBooleanFunction = () => {
    dispatch(setkeepExistingBottomSheetVisibleBoolean(false));
    setIsValidPrepaidNumber(false);
  };

  return (
    <>
      <View
        style={[
          styles.sheetWrapper,
          { paddingBottom: useSafeAreaInsets().bottom },
        ]}
      >
        <View style={styles.closeButton}>
          <TouchableOpacity
            {...setTestID(
              `${testIds?.KeepExistingSimSheetIcon1}_${'1touchableo'}`
            )}
            onPress={() => {
              /* istanbul ignore next */
              closeButtonClicked && closeButtonClicked();
            }}
          >
            <DuIcon
              {...setTestID(testIds?.KeepExistingSimSheetIcon1)}
              iconName="cancel"
              iconColor="#B9BDC6"
            />
          </TouchableOpacity>
        </View>
        <DuText
          {...setTestID(testIds?.KeepExistingSimSheetDuText1)}
          style={styles.headline}
        >
          {env?.kepp_existing_number_common_text}
        </DuText>

        {isValidPrepaidNumber ? (
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
                  text: `${data?.textInput}`,
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
        ) : (
          <View>
            <DuTextInput
              {...setTestID(testIds?.KeepExistingSimSheetDuTextInput1)}
              title={env?.enter_your_number_text}
              titleStyle={{
                fontFamily: 'Inter-Medium',
                fontSize: 14,
                letterSpacing: -0.1,
                marginBottom: 2,
                lineHeight: 20,
                color: '#181C24',
              }}
              value={data.textInput}
              showClearButton={data.isClear}
              showWarning={data.isError}
              inputTextStyle={{
                fontFamily: 'Inter-Medium',
                fontSize: 18,
                letterSpacing: -0.15,
                lineHeight: 24,
                color: '#181C24',
              }}
              error={data.isError}
              errorMessage={
                data.isError && (`${env?.not_valide_number_text}` as any)
              }
              errorMessageStyle={{
                color: '#E4002B',
                fontFamily: 'Inter-Medium',
                fontSize: 13,
              }}
              maxLength={data.maxLength}
              keyboardType="number-pad"
              onChangeText={(text) => upgradeToPrepaidHandler(text)}
              placeholder={'050 142 6510'}
            />
            <DuText
              {...setTestID(testIds?.KeepExistingSimSheetDuText2)}
              style={styles.subheading}
            >
              {env?.portin_mobile_network_text}
            </DuText>
            <View style={{}}>
              <DuButtonGroup
                {...setTestID(
                  `${testIds?.KeepExistingSimSheetDuButton}_${'2DuButtonGroup'}`
                )}
                onPress={(key: number) => {
                  /* istanbul ignore next */
                  handleButtonGroupTap(key);
                }}
                selectedId={standardIndex}
                buttons={existingNetworks}
                type={'group-list'}
                lines={[]}
                disabled={false}
              />
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignContent: 'space-between',
                position: 'relative',
                marginTop: 22,
                marginBottom: standardIndex == 1 ? 24 : 36,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  position: 'relative',
                }}
              >
                <DuText
                  {...setTestID(testIds?.KeepExistingSimSheetDuText3)}
                  style={{ fontSize: 14, color: '#3B4559', marginRight: 5.67 }}
                >
                  {env?.proceed_with_esim_text}
                </DuText>
                <TouchableOpacity
                  {...setTestID(
                    `${
                      testIds?.KeepExistingSimSheetDuButton
                    }_${'3TouchableOpacity'}`
                  )}
                >
                  <DuIcon
                    {...setTestID(testIds?.KeepExistingSimSheetDuIcon2)}
                    iconName={'info'}
                    artWorkHeight={24}
                    artWorkWidth={24}
                    iconColor={'#677084'}
                  />
                </TouchableOpacity>
              </View>
              <View
                style={{
                  flex: 1,
                  alignItems: 'flex-end',
                  alignSelf: 'center',
                  position: 'relative',
                }}
              >
                <DuSwitch
                  {...setTestID(testIds?.KeepExistingSimSheetDuSwitch)}
                  value={false}
                  onValueChange={(value) => {
                    setIsESIMClicked(value);
                  }}
                />
              </View>
            </View>
            {standardIndex == 1 ? (
              <View style={{ paddingVertical: 18, bottom: 20 }}>
                <DuEditorial
                  {...setTestID(testIds?.KeepExistingSimSheetDuEditorial)}
                  {...props}
                />
              </View>
            ) : null}
            {standardIndex === 1 ? (
              <View style={styles.checkBtnRow}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignContent: 'center',
                    alignItems: 'center',
                    bottom: 20,
                  }}
                >
                  <View
                    style={{
                      marginRight: 11,
                    }}
                  >
                    <DuCheckBox
                      {...setTestID(testIds?.KeepExistingSimSheetDuCheckBox)}
                      onValueChange={(value) => {
                        console.log('........checkbox ', value);
                        setIsTOSChecked(value);
                      }}
                      containerStyle={{ alignSelf: 'center' }}
                    />
                  </View>
                  <DuText
                    {...setTestID(testIds?.KeepExistingSimSheetDuText4)}
                    style={{
                      color: '#3B4559',
                      fontFamily: 'Inter-Regular',
                      fontSize: 14,
                      lineHeight: 20,
                    }}
                  >
                    {env?.read_and_agree_text}
                  </DuText>
                  <DuText
                    {...setTestID(testIds?.KeepExistingSimSheetDuText5)}
                    style={[
                      styles.subheading,
                      {
                        fontWeight: '500',
                        fontFamily: 'Inter-Regular',
                        color: '#753BBD',
                        marginTop: 0,
                        textDecorationLine: 'underline',
                        lineHeight: 40,
                      },
                    ]}
                  >
                    {' '}
                    {env?.terms_of_text}
                  </DuText>
                </View>
              </View>
            ) : null}
          </View>
        )}
        <View style={{ bottom: standardIndex == 1 ? 20 : 0 }}>
          <DuButton
            {...setTestID(testIds?.KeepExistingSimSheetDuButton)}
            type={isValidPrepaidNumber ? 'secondary' : 'primary'}
            title={
              isValidPrepaidNumber
                ? env?.try_again_with_another_number_common_text
                : env?.confirm_common_text
            }
            onPress={() =>
              isValidPrepaidNumber
                ? handleKeepExistingBottomSheetVisibleBooleanFunction()
                : checkPortIn()
            }
          />
        </View>

        {/* <View style={{marginBottom: 500}}/> */}
      </View>
      <AlertComponent
        {...setTestID(
          `${testIds?.KeepExistingSimSheetDuButton}_${'AlertComponent'}`
        )}
        isVisible={isVisibleAlert}
        status={status}
        phoneNumber={data.textInput}
        onPressChooseDifferentNumber={
          /* istanbul ignore next */
          () => {
            setIsVisibleAlert(false);
          }
        }
      />
    </>
  );
};

const styles = StyleSheet.create({
  sheetWrapper: {
    backgroundColor: 'white',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    // padding: 18,
    paddingRight: 16,
    paddingLeft: 16,
    // paddingBottom: 32,
  },
  closeButton: {
    justifyContent: 'flex-end',
    flexDirection: 'row',
  },
  headline: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    lineHeight: 22,
    marginBottom: 20,
  },
  subheading: {
    color: '#3B4559',
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 24,
  },
  toggleBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 32,
  },
  checkBtnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 25,
  },
});

export default KeepExistingSimSheetBody;
