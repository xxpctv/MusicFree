import MusicQueue from '@/common/musicQueue';
import MusicSheet from '@/common/musicSheet';
import {check, PERMISSIONS, request} from 'react-native-permissions';
import TrackPlayer, { Capability } from 'react-native-track-player';
import {pluginManager} from '../common/pluginManager';
import 'react-native-get-random-values';
import {ToastAndroid} from 'react-native';
import { loadConfig } from '@/common/localConfigManager';
import RNBootSplash from "react-native-bootsplash";

/** app加载前执行 */
export default async function () {
  // 检查权限
  const [readStoragePermission, writeStoragePermission] = await Promise.all([
    check(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE),
    check(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE),
  ]);
  if (
    !(
      readStoragePermission === 'granted' &&
      writeStoragePermission === 'granted'
    )
  ) {
    await request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
    await request(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);
  }

  // 加载配置
  await loadConfig();
  // 加载插件

  Promise.all([
    await pluginManager.initPlugins(),
    await TrackPlayer.setupPlayer(),
    await TrackPlayer.updateOptions({
      progressUpdateEventInterval: 2,
      stopWithApp: false,
      alwaysPauseOnInterruption: true,
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
      ],
      compactCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
      ],
      notificationCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
      ]
    })
  ]);
  await MusicQueue.setupMusicQueue();
  await MusicSheet.initMusicSheet();

  ErrorUtils.setGlobalHandler(error => ToastAndroid.show(`error: ${error?.message}`, ToastAndroid.LONG));
   // 隐藏开屏动画
  RNBootSplash.hide({fade: true});
}