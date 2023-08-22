import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  DuButton,
  DuHeader,
  DuJumbotron,
  DuBanner,
  DuBannerProps,
  DuIconProps,
  DuButtonsDock,
} from '@du-greenfield/du-ui-toolkit';
import { mask } from 'react-native-mask-text';
import React, { FC, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getMicroAppContext, getSalesOrder, microappId } from '../../../';
import type { DealerNavigatorParamList } from '../../../navigator';
import EnterICCIDManuallyModal from '../SimActivationScan/EnterICCIDManuallyModal';
import testIds, { setTestID } from '../../../assets/support/testIds';
import { DuAnalyticsPlugin, DuAnalyticsTagBuilder } from '@du-greenfield/du-analytics-plugin-core';
import DuAnalyticsFirebasePlugin from '@du-greenfield/du-firebase-analytics';

import { useEnvironmentAbstract } from '@du-greenfield/du-abstract-environment-plugin'
/* istanbul ignore next */
export type SimCapturedScreenProps = NativeStackScreenProps<
  DealerNavigatorParamList,
  'SimCapturedScreen'
> & {
  params: any;
  onRescanTap: () => void;
  onSimActivateTap: (barcode: string) => void;
  helpButtonPressedOnOrder: (routeName: string) => void;
  gotoDashboardClicked: () => void;
  uniTest: boolean;
};

const SimCapturedScreen: FC<SimCapturedScreenProps> = ({
  params,
  navigation,
  onSimActivateTap,
  onRescanTap,
  gotoDashboardClicked,
  uniTest,
}) => {
  const [isModalVisible, setIsModalVisible] = useState<boolean>(uniTest);
  const { simScanned, scannedBarcode } = params;
  const [contextualSupport] = useState<boolean>(
    getMicroAppContext().appData.ContextualSupport
  );
  const env = useEnvironmentAbstract(
    [microappId],
    getMicroAppContext()?.appLanguage!,
    getMicroAppContext()?.appType
  );
  /* istanbul ignore next */
  const props: DuBannerProps = {
    icon: {
      iconName: 'info',
      iconColor: simScanned ? '#00933E' : '#BA0023',
    } as DuIconProps,
    title: simScanned ? `${env?.sim_captured_banner_title}` :`${env?.sim_captured_banner_2_title}`,
    type: simScanned ? 'positive' : 'danger',
    //@ts-ignore
    buttontitle: '',
  };

  /* istanbul ignore next */
  const takeAPhotoButton = () => {
    return (
      <View style={styles.takeAPhotoButtonContainer}>
        <DuButton
          {...setTestID(testIds?.SimCapturedScreenDuButton1)}
          testID="scan_sim_again_button"
          title={env?.sim_captured_scan_sim_title}
          type="primary"
          onPress={() => {
            onAnalyticsEvent({eventName:'sim_barcode_scan'})
            onRescanTap && onRescanTap();
          }}
        />
      </View>
    );
  };

  /* istanbul ignore next */
  const enterManualyButton = () => {
    return (
      <>
        {!simScanned ? (
          <View style={styles.enterManuallyButtonContainer}>
            <DuButton
              {...setTestID(testIds?.SimCapturedScreenDuButton2)}
              testID="enter_ecid_number_button"
              title={env?.enter_iccid_manually_common_text}
              type="secondary"
              onPress={() => {
                onAnalyticsEvent({eventName:'sim_barcode_iccid_manual'})
                setIsModalVisible(true);
              }}
            />
          </View>
        ) : null}
      </>
    );
  };

  const onAnalyticsEvent = ({ eventName }: { eventName: string }) => {
    let tagBuilder = new DuAnalyticsTagBuilder();
    let params = tagBuilder
      .journeyName('postpaid - dealer app')
      .subJourneyName(`postpaid only : new number`)
      // .pageType('sim card activation')
      .planId(getSalesOrder().product.id.toLowerCase())
      .planName(getSalesOrder().product.name.toLowerCase())
      .build()
    let analytics: DuAnalyticsPlugin = new DuAnalyticsFirebasePlugin();
    analytics.logEvent(eventName, params);
  }

  /* istanbul ignore next */
  return (
    <View style={styles.root}>
      <DuHeader
        {...setTestID(testIds?.SimCapturedScreenDuHeader)}
        //@ts-ignore
        leftButtonTestID="leftPress"
        safeArea={true}
        left="back"
        leftPressed={() => {
          navigation.goBack();
        }}
        right={'tertiary'}
        rightTertiary={
          contextualSupport
            ? {
              text: 'Help',
            }
            : undefined
        }
        navToDashBoard={true}
        rightTertiarySupport={{
          /* istanbul ignore next */
          pressed: () => gotoDashboardClicked(),
        }}
        statusBar={{
          backgroundColor: 'white',
          barStyle: 'dark-content',
        }}
        background="white"
      />
      <ScrollView style={[styles.subContainer]}>
        <DuJumbotron
          {...setTestID(testIds?.SimCapturedScreenDuJumbotron)}
          mainJumbotron={env?.sim_bar_code_common_text}
        />
        <View style={styles.middleContainer}>
          <DuJumbotron
            {...setTestID(`${testIds.DealerSimCaptureV2DuJumbotron}_`)}
            mainJumbotron={
              getSalesOrder().msisdn?.msisdn
                ? mask(
                  `0${getSalesOrder().msisdn?.msisdn?.substring(3)}`,
                  '999 999 99999'
                )
                : ''
            }
            overLine="SIM 1"
            alignment="center"
          />
          <View style={styles.simCardPlaceholderContainer}>
            <Image
              source={require('../SimActivationScan/sim-card-placeholder.png')}
              {...setTestID(`${testIds.DealerSimCaptureV2Image1}_`)}
            />
            <View style={styles.simCardOverlayContainer}>
              <View>
                <Image source={require('../SimActivationScan/du-logo.png')}
                  {...setTestID(`${testIds.DealerSimCaptureV2image2}_`)} />
              </View>
              <View style={styles.simCardOverlayContentContainer}>
                <View>
                  <Text style={styles.iccidNumberTitle}
                    {...setTestID(`${testIds.DealerSimCaptureV2text1}_`)}>
                     {env?.common_iccid_number_text}</Text>
                </View>
                <View style={styles.iccidNumberContainer}>
                  <Text style={styles.iccidNumber}
                    {...setTestID(`${testIds.DealerSimCaptureV2text2}_`)}>
                    {scannedBarcode ? scannedBarcode : 'N/A'}
                  </Text>
                </View>
                <View style={styles.barcodeContainer}>
                  <Image source={require('../SimActivationScan/barcode.png')}
                    {...setTestID(`${testIds.DealerSimCaptureV2image3}_`)} />
                </View>
                <View style={styles.barcodeNumberContainer}>
                  <Text style={styles.barcodeNumber}
                    {...setTestID(`${testIds.DealerSimCaptureV2text3}_`)}>
                    {scannedBarcode ? scannedBarcode :  `${env?.sim_captured_smaple_number_text}`}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          <View style={{ width: 340, marginBottom: 32 }}>
            <DuBanner
              {...setTestID(testIds?.SimCapturedScreenDuBanner)}
              {...props}
            />
          </View>
          {simScanned ? undefined : takeAPhotoButton()}
          <View style={{ marginBottom: 100 }}>{enterManualyButton()}</View>
        </View>
        <EnterICCIDManuallyModal
          {...setTestID(`${testIds.DealerSimCaptureV2text3}_${"M-TEST"}`)}
          isVisible={isModalVisible}
          onPressClose={() => {
            setIsModalVisible(false);
          }}
          verifyAndContinue={() => {
            setIsModalVisible(false);
            onAnalyticsEvent({eventName:'sim_barcode_iccid_manual_verify'})
            onSimActivateTap && onSimActivateTap(scannedBarcode);
          }}
        />
      </ScrollView>
      <DuButtonsDock
        {...setTestID(testIds?.SimCapturedScreenDuButtonsDock)}
        tab
        items={[
          <DuButton
            {...setTestID(testIds?.SimCapturedScreenDuButton3)}
            testID="activate_sim_button"
            title={env?.sim_captured_active_sim_text}
            type="primary"
            disabled={!simScanned}
            onPress={() => {
              /* istanbul ignore next */
              onAnalyticsEvent({eventName:'sim_activation_success'})
              onSimActivateTap && onSimActivateTap(scannedBarcode);
            }}
          />,
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  subContainer: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 105,
    paddingVertical: 32,
  },
  middleContainer: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  simCardPlaceholderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  simCardOverlayContainer: {
    position: 'absolute',
    width: 300,
    height: 180,
  },
  simCardOverlayContentContainer: {
    width: 180,
    marginTop: 17,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iccidNumberTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 11,
    textAlign: 'center',
    color: '#5E687D',
    lineHeight: 20,
  },
  iccidNumberContainer: { marginTop: 8 },
  iccidNumber: {
    fontFamily: 'Inter-Medium',
    fontSize: 15,
    textAlign: 'center',
    color: '#041333',
    lineHeight: 24,
    letterSpacing: -0.15,
  },
  barcodeContainer: { marginTop: 24 },
  barcodeNumberContainer: { marginTop: 7 },
  barcodeNumber: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    textAlign: 'center',
    color: '#233659',
    lineHeight: 20,
  },
  enterManuallyButtonContainer: { width: 340, marginTop: 16 },
  takeAPhotoButtonContainer: { width: 340 },
});

export default SimCapturedScreen;
