import { useFocusEffect } from '@react-navigation/native'
import { useAudioPlayer } from 'expo-audio'
import React, { useCallback } from 'react'
import { Text, View } from 'react-native'

const bgmSource = require('@/assets/sounds/bgm.mp3')

export const Game = () => {
  const player = useAudioPlayer(bgmSource)

  useFocusEffect(
    useCallback(() => {
      // 画面がフォーカスされた時にBGMを最初から再生
      console.log("Game画面がフォーカスされました。BGMを最初から再生します。")

      // 再生位置を0にリセット
      player.seekTo(0)

      // ループ再生を有効化
      player.loop = true

      // BGMを再生
      player.play()

      // 画面がフォーカスを失った時にBGMを停止
      return () => {
        console.log("Game画面を離れます。BGMを停止します。")
        player.pause()
      }
    }, [player])
  )

  return (
    <View>
      <Text>game</Text>
    </View>
  )
}

export default Game
