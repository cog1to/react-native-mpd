import { Dimensions, Platform } from 'react-native'

export function isIphoneX() {
    const dim = Dimensions.get('window')
  
    return (
        // This has to be iOS
        Platform.OS === 'ios' &&
    
        // Check either, iPhone X or XR
        (isIPhoneXSize(dim) || isIPhoneXrSize(dim) || isIPhone11(dim) || isIPhone11ProMax(dim))
    )
}

export function isIpadPro() {
    const dim = Dimensions.get('window')
  
    return (
        // This has to be iOS
        Platform.OS === 'ios' &&
    
        // Check either, iPhone X or XR
        (isIpadPro13(dim))
    )
}

export function isIPhoneXSize(dim) {
    return dim.height == 812 || dim.width == 812
}

export function isIPhoneXrSize(dim) {
    return dim.height == 896 || dim.width == 896
}

export function isIPhone11(dim) {
    return dim.height == 826 || dim.width == 826
}

export function isIPhone11ProMax(dim) {
    return dim.height == 896 || dim.width == 896
}

export function isIpadPro13(dim) {
    return dim.height == 1366 || dim.width == 1366
}
