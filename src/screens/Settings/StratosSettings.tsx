import {View} from 'react-native'
import {msg} from '@lingui/core/macro'
import {useLingui} from '@lingui/react'
import {Trans} from '@lingui/react/macro'
import {type NativeStackScreenProps} from '@react-navigation/native-stack'

import {type CommonNavigatorParams} from '#/lib/routes/types'
import {useStratos} from '#/state/stratos'
import * as SettingsList from '#/screens/Settings/components/SettingsList'
import {atoms as a, useTheme} from '#/alf'
import * as TextField from '#/components/forms/TextField'
import * as Toggle from '#/components/forms/Toggle'
import {ArrowRotateClockwise_Stroke2_Corner0_Rounded as ArrowRotateIcon} from '#/components/icons/ArrowRotate'
import {At_Stroke2_Corner0_Rounded as AtIcon} from '#/components/icons/At'
import {Trash_Stroke2_Corner0_Rounded as TrashIcon} from '#/components/icons/Trash'
import * as Layout from '#/components/Layout'
import {Text} from '#/components/Typography'
import {STRATOS_SERVICE_DID} from '#/env'

type Props = NativeStackScreenProps<CommonNavigatorParams, 'StratosSettings'>
export function StratosSettingsScreen({}: Props) {
  const t = useTheme()
  const {_} = useLingui()

  const {
    active,
    setActive,
    enrollment,
    serviceUrl,
    customServiceDid,
    setCustomServiceDid,
    refreshEnrollment,
  } = useStratos()

  const envServiceDid = STRATOS_SERVICE_DID
  const resolvedServiceDid = customServiceDid || envServiceDid

  return (
    <Layout.Screen>
      <Layout.Header.Outer>
        <Layout.Header.BackButton />
        <Layout.Header.Content>
          <Layout.Header.TitleText>
            <Trans>Stratos</Trans>
          </Layout.Header.TitleText>
        </Layout.Header.Content>
        <Layout.Header.Slot />
      </Layout.Header.Outer>
      <Layout.Content>
        <SettingsList.Container>
          {/* Service DID */}
          <SettingsList.Group>
            <SettingsList.ItemIcon icon={AtIcon} />
            <SettingsList.ItemText>
              <Trans>Service DID</Trans>
            </SettingsList.ItemText>
            <TextField.Root>
              <TextField.Input
                label={_(msg`Stratos service DID`)}
                placeholder={envServiceDid || 'did:web:stratos.example.com'}
                defaultValue={customServiceDid}
                onChangeText={setCustomServiceDid}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
              />
            </TextField.Root>
          </SettingsList.Group>

          <SettingsList.Divider />

          {/* Active toggle */}
          <SettingsList.Group>
            <Toggle.Item
              name="stratos_active"
              label={_(msg`Route API calls through Stratos`)}
              value={active}
              onChange={setActive}
              style={[a.w_full]}>
              <Toggle.LabelText style={[a.flex_1]}>
                <Trans>Active</Trans>
              </Toggle.LabelText>
              <Toggle.Platform />
            </Toggle.Item>
          </SettingsList.Group>

          <SettingsList.Divider />

          {/* Enrollment status */}
          <SettingsList.Group>
            <SettingsList.ItemText>
              <Trans>Status</Trans>
            </SettingsList.ItemText>
            {!resolvedServiceDid ? (
              <Text style={[a.text_sm, t.atoms.text_contrast_medium]}>
                <Trans>No Stratos service configured</Trans>
              </Text>
            ) : enrollment === undefined ? (
              <Text style={[a.text_sm, t.atoms.text_contrast_medium]}>
                <Trans>Checking enrollment...</Trans>
              </Text>
            ) : enrollment === null ? (
              <Text style={[a.text_sm, {color: t.palette.negative_500}]}>
                <Trans>Not enrolled in Stratos</Trans>
              </Text>
            ) : (
              <View style={[a.gap_xs]}>
                <Text style={[a.text_sm, {color: t.palette.positive_500}]}>
                  <Trans>Connected</Trans>
                </Text>
                {serviceUrl && (
                  <Text
                    style={[
                      a.text_sm,
                      a.leading_snug,
                      t.atoms.text_contrast_medium,
                    ]}
                    numberOfLines={2}>
                    {serviceUrl}
                  </Text>
                )}
              </View>
            )}
          </SettingsList.Group>

          <SettingsList.Divider />

          {/* Actions */}
          <SettingsList.Group>
            <SettingsList.PressableItem
              label={_(msg`Refresh enrollment status`)}
              onPress={refreshEnrollment}>
              <SettingsList.ItemIcon icon={ArrowRotateIcon} />
              <SettingsList.ItemText>
                <Trans>Refresh</Trans>
              </SettingsList.ItemText>
            </SettingsList.PressableItem>
            <SettingsList.PressableItem
              label={_(msg`Reset Stratos configuration`)}
              onPress={() => {
                setCustomServiceDid(undefined)
                setActive(false)
                refreshEnrollment()
              }}>
              <SettingsList.ItemIcon icon={TrashIcon} />
              <SettingsList.ItemText>
                <Trans>Reset</Trans>
              </SettingsList.ItemText>
            </SettingsList.PressableItem>
          </SettingsList.Group>
        </SettingsList.Container>
      </Layout.Content>
    </Layout.Screen>
  )
}
