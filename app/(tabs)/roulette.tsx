import { useFocusEffect } from '@react-navigation/native'
import { useAudioPlayer } from 'expo-audio'
import { Image } from 'expo-image'
import React, { useCallback, useRef, useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

const bgmSource = require('@/assets/sounds/bgm.mp3')
const spinSoundSource = require('@/assets/sounds/bgm2.mp3')
const parrotImage = require('@/assets/images/parrot/slowparrot.gif')
const fastParrotImage = require('@/assets/images/parrot/fastparrot.gif')

// フェードの設定
const FADE_DURATION = 500 // フェード時間（ミリ秒）
const FADE_STEPS = 20 // フェードのステップ数
const FADE_INTERVAL = FADE_DURATION / FADE_STEPS // 各ステップの間隔

export const Roulette = () => {
  const player = useAudioPlayer(bgmSource)
  const spinPlayer = useAudioPlayer(spinSoundSource)
  const fadeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [image, setImage] = useState(parrotImage)
  const [isSpinning, setIsSpinning] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  // フェードイン関数
  const fadeIn = useCallback(() => {
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current)
    }

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
    if (isSpinning) return

    setIsSpinning(true)
    setResult(null)

    // スピン用サウンドを最初から再生（ループ無効）
    try {
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

      player.seekTo(0)
      player.loop = true
      fadeIn()

      return () => {
        console.log("ルーレット画面を離れます。BGMをフェードアウトで停止します。")
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
      <Text style={styles.title}>ルーレット</Text>

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
