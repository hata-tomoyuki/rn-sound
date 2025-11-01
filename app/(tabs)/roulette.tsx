import { useFocusEffect } from '@react-navigation/native'
import { useAudioPlayer } from 'expo-audio'
// expo-audio を複数用途で利用：
// - player: 画面BGM（ループ、フェード制御）
// - spinPlayer: ルーレット開始のBGM（単発）
// - sfx: ワンショット効果音（ボタン押下など）
import { Image } from 'expo-image'
import React, { useCallback, useRef, useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

// 使う音源を事前にrequireしておきます。
// requireを使うことでビルド時にアセットが確実に含まれます。
const bgmSource = require('@/assets/sounds/bgm.mp3')
const spinSoundSource = require('@/assets/sounds/bgm2.mp3')
const parrotImage = require('@/assets/images/parrot/slowparrot.gif')
const fastParrotImage = require('@/assets/images/parrot/fastparrot.gif')
const sfxSource = require('@/assets/sounds/sound.mp3');

// フェードの設定：setIntervalで段階的にvolumeを上げ下げして「フェード」を再現します。
const FADE_DURATION = 500 // フェード時間（ミリ秒）
const FADE_STEPS = 20 // フェードのステップ数
const FADE_INTERVAL = FADE_DURATION / FADE_STEPS // 各ステップの間隔

export const Roulette = () => {
  // 画面BGM用プレイヤー。loopやvolumeを柔軟に制御します。
  const player = useAudioPlayer(bgmSource)
  // スピンBGM用（単発）。フェードは不要なのでループもOFFにします。
  const spinPlayer = useAudioPlayer(spinSoundSource)
  // 効果音（短いSE）。必要な時だけseekTo(0)→play()します。
  const sfx = useAudioPlayer(sfxSource);

  const fadeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [image, setImage] = useState(parrotImage)
  const [isSpinning, setIsSpinning] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  // フェードイン関数
  const fadeIn = useCallback(() => {
    // 既存のフェード処理が動いている場合は止める（重複を避ける）
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current)
    }

    // 音量を0から始めて、段階的に1.0まで上げます。
    player.volume = 0
    player.play()

    let currentStep = 0
    fadeIntervalRef.current = setInterval(() => {
      currentStep++
      const volume = Math.min(currentStep / FADE_STEPS, 1.0)
      player.volume = volume

      if (currentStep >= FADE_STEPS) {
        if (fadeIntervalRef.current) {
          clearInterval(fadeIntervalRef.current)
          fadeIntervalRef.current = null
        }
      }
    }, FADE_INTERVAL)
  }, [player])

  // フェードアウト関数
  const fadeOut = useCallback((onComplete?: () => void) => {
    // 既存のフェード処理が動いている場合は止める（重複を避ける）
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current)
    }

    let currentStep = FADE_STEPS
    fadeIntervalRef.current = setInterval(() => {
      currentStep--
      const volume = Math.max(currentStep / FADE_STEPS, 0.0)
      player.volume = volume

      if (currentStep <= 0) {
        if (fadeIntervalRef.current) {
          clearInterval(fadeIntervalRef.current)
          fadeIntervalRef.current = null
        }
        player.pause()
        if (onComplete) {
          onComplete()
        }
      }
    }, FADE_INTERVAL)
  }, [player])


  // ルーレットを回転させる
  const spinRoulette = () => {
    // 二重押下防止：再生中は何もしない
    if (isSpinning) return

    setIsSpinning(true)
    setResult(null)

    // スピン開始時のサウンド演出：
    // 1) 短いSE(sfx)を鳴らす 2) 画面BGMをフェードアウト 3) スピン用BGMを頭から再生
    try {
      sfx.seekTo(0);
      sfx.play();
      spinPlayer.loop = false
      fadeOut()
      spinPlayer.seekTo(0)
      spinPlayer.play()
      setImage(fastParrotImage)
    } catch (e) {
      console.warn('スピン音の再生に失敗しました', e)
    }

  }

  useFocusEffect(
    useCallback(() => {
      console.log("ルーレット画面がフォーカスされました。BGMをフェードインで再生します。")

      // タブで再訪問された場合にも自然に聞こえるよう毎回フェードイン。
      player.seekTo(0)
      player.loop = true
      fadeIn()

      return () => {
        console.log("ルーレット画面を離れます。BGMをフェードアウトで停止します。")
        // 別タブに移動したらBGMはフェードアウト。
        fadeOut()
        setImage(parrotImage)
        setIsSpinning(false)
        // 画面離脱時にスピン音も停止
        spinPlayer.pause()
      }
    }, [player, fadeIn, fadeOut, spinPlayer])
  )

  return (
    <View style={styles.container}>
      <Text style={styles.title}>おうむルーレット</Text>

      <View style={styles.imageContainer}>
        <Image
          source={image}
          style={styles.parrotImage}
        />
      </View>

      {/* 結果表示 */}
      {result && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>{result}</Text>
        </View>
      )}

      {/* スタートボタン */}
      <TouchableOpacity
        style={[styles.button, isSpinning && styles.buttonDisabled]}
        onPress={spinRoulette}
        disabled={isSpinning}
      >
        <Text style={styles.buttonText}>
          {isSpinning ? '回転中...' : 'ルーレットを回す'}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

export default Roulette

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#333',
  },
  imageContainer: {
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  parrotImage: {
    width: 300,
    height: 300,
  },
  resultContainer: {
    marginTop: 20,
    marginBottom: 20,
    padding: 20,
    backgroundColor: '#4ECDC4',
    borderRadius: 10,
    minWidth: 200,
    alignItems: 'center',
  },
  resultText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  button: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: '#CCC',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
})
