import { useFocusEffect } from '@react-navigation/native'
import { useAudioPlayer } from 'expo-audio'
import React, { useCallback, useRef } from 'react'
import { Text, View } from 'react-native'

const bgmSource = require('@/assets/sounds/bgm.mp3')

// フェードの設定
const FADE_DURATION = 500 // フェード時間（ミリ秒）
const FADE_STEPS = 20 // フェードのステップ数
const FADE_INTERVAL = FADE_DURATION / FADE_STEPS // 各ステップの間隔

export const Fade = () => {
  const player = useAudioPlayer(bgmSource)
  const fadeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // フェードイン関数
  const fadeIn = useCallback(() => {
    // 既存のフェード処理をクリア
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current)
    }

    // 音量を0から開始
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
    // 既存のフェード処理をクリア
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

  useFocusEffect(
    useCallback(() => {
      // 画面がフォーカスされた時にBGMをフェードインで再生
      console.log("Game画面がフォーカスされました。BGMをフェードインで再生します。")

      // 再生位置を0にリセット
      player.seekTo(0)

      // ループ再生を有効化
      player.loop = true

      // フェードインで再生
      fadeIn()

      // 画面がフォーカスを失った時にBGMをフェードアウトで停止
      return () => {
        console.log("Game画面を離れます。BGMをフェードアウトで停止します。")
        fadeOut()
      }
    }, [player, fadeIn, fadeOut])
  )

  return (
    <View>
      <Text>game</Text>
    </View>
  )
}

export default Fade
