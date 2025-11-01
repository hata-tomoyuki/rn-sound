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
  // 目的: 無音(0.0)から通常音量(1.0)まで段階的に音量を上げて、
  //       “スッと音が入ってくる”ような自然な演出を実現します。
  // ポイント:
  // - setIntervalで短い間隔ごとにvolumeを少しずつ増やす
  // - 既存のフェードタイマーが動いていたら必ず止める（二重進行防止）
  // - 最後にタイマーを必ず解放する
  const fadeIn = useCallback(() => {
    // 既存のフェード処理をクリア
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current)
    }

    // 音量を0から開始
    // 先にvolumeを0にしてからplay()することで、再生開始の瞬間の「鳴り始めの違和感」を避けます。
    player.volume = 0
    player.play()

    let currentStep = 0
    fadeIntervalRef.current = setInterval(() => {
      currentStep++
      // volumeは0.0〜1.0の範囲。段階数で割って0→1に線形に近づけます。
      // 念のためMath.minで上限1.0を保証します。
      const volume = Math.min(currentStep / FADE_STEPS, 1.0)
      player.volume = volume

      if (currentStep >= FADE_STEPS) {
        // 規定ステップに達したらタイマーを停止し、参照もクリアします。
        if (fadeIntervalRef.current) {
          clearInterval(fadeIntervalRef.current)
          fadeIntervalRef.current = null
        }
      }
    }, FADE_INTERVAL)
  }, [player])

  // フェードアウト関数
  // 目的: 現在の音量(想定:1.0)から0.0へ段階的に下げて、
  //       “自然に音が消えていく”演出を実現します。
  // onComplete: フェードアウト完了後に実行したい処理（画面遷移や別トラック再生など）を渡せます。
  const fadeOut = useCallback((onComplete?: () => void) => {
    // 既存のフェード処理をクリア
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current)
    }

    let currentStep = FADE_STEPS
    fadeIntervalRef.current = setInterval(() => {
      currentStep--
      // volumeが0未満にならないように下限0.0を保証します。
      const volume = Math.max(currentStep / FADE_STEPS, 0.0)
      player.volume = volume

      if (currentStep <= 0) {
        // 最終的にpause()して無音状態で停止します。
        if (fadeIntervalRef.current) {
          clearInterval(fadeIntervalRef.current)
          fadeIntervalRef.current = null
        }
        player.pause()
        // フェードアウト後に続けて行いたい処理があれば呼び出します。
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
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>game</Text>
    </View>
  )
}

export default Fade
