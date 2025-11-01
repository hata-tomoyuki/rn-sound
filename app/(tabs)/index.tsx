import { Image } from 'expo-image';
import { Button, Platform, StyleSheet, View } from 'react-native';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';

import { useEffect, useState } from 'react';

import { Audio } from "expo-av";
// expo-av: 低レベルなオーディオAPI。
// ・Soundインスタンスを作り、非同期でロード/アンロード、再生/停止などを行います。
// ・細かい制御ができる反面、初期化/クリーンアップを自分で書く必要があります。

// 再生する音源（アセット）をrequireで指定します。
const testSound = require("@/assets/sounds/bgm.mp3");

export default function HomeScreen() {
  // Audio.Soundは非同期にロードされるため、状態で保持します。
  const [audio, setAudio] = useState<Audio.Sound | null>(null);

  useEffect(() => {
    // マウント時に音声をロードし、アンマウント時に解放します。
    // ローカル変数に保持しておくと、クリーンアップで確実に参照できます。
    let sound: Audio.Sound | undefined;
    const initAudio = async () => {
      try {
        const created = await Audio.Sound.createAsync(testSound);
        sound = created.sound;
        setAudio(created.sound); // UI側でも使えるようにstateへ
      } catch (error) {
        console.error("音声の初期化中にエラーが発生しました:", error);
      }
    };
    initAudio();
    return () => {
      // クリーンアップ：Soundインスタンスは必ずunloadAsyncでメモリを解放します。
      // これを忘れると、再読み込み時にリソースリークや再生不具合が出ることがあります。
      sound?.unloadAsync();
    };
  }, []);

  async function playAudio() {
    // playAsync: 非同期に再生を開始します。ロード済みである必要があります。
    await audio?.playAsync();
  }
  async function stopAudio() {
    // stopAsync: 再生位置が先頭に戻る停止。pauseはその場で止まります。
    await audio?.stopAsync();
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>
      <View>
        <Button title="Play Audio" onPress={playAudio} />
        <Button title="Stop Audio" onPress={stopAudio} />
      </View>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 1: Try it</ThemedText>
        <ThemedText>
          Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to see changes.
          Press{' '}
          <ThemedText type="defaultSemiBold">
            {Platform.select({
              ios: 'cmd + d',
              android: 'cmd + m',
              web: 'F12',
            })}
          </ThemedText>{' '}
          to open developer tools.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <Link href="/modal">
          <Link.Trigger>
            <ThemedText type="subtitle">Step 2: Explore</ThemedText>
          </Link.Trigger>
          <Link.Preview />
          <Link.Menu>
            <Link.MenuAction title="Action" icon="cube" onPress={() => alert('Action pressed')} />
            <Link.MenuAction
              title="Share"
              icon="square.and.arrow.up"
              onPress={() => alert('Share pressed')}
            />
            <Link.Menu title="More" icon="ellipsis">
              <Link.MenuAction
                title="Delete"
                icon="trash"
                destructive
                onPress={() => alert('Delete pressed')}
              />
            </Link.Menu>
          </Link.Menu>
        </Link>

        <ThemedText>
          {`Tap the Explore tab to learn more about what's included in this starter app.`}
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
        <ThemedText>
          {`When you're ready, run `}
          <ThemedText type="defaultSemiBold">npm run reset-project</ThemedText> to get a fresh{' '}
          <ThemedText type="defaultSemiBold">app</ThemedText> directory. This will move the current{' '}
          <ThemedText type="defaultSemiBold">app</ThemedText> to{' '}
          <ThemedText type="defaultSemiBold">app-example</ThemedText>.
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
