import Keycloak from 'keycloak-js'

const keycloak = new Keycloak({
    url: '/keycloak',
    realm: 'connected-lock',
    clientId: 'vue-app',
})

export function initKeycloak() {
    return keycloak.init({
        onLoad: 'login-required',
        checkLoginIframe: false,
        enableLogging: true
    })
}

export function logout() {
    keycloak.logout({ redirectUri: window.location.origin })
}

export function getToken() {
    return keycloak.token
}

export function updateToken(minValidity: number = 30) {
    return keycloak.updateToken(minValidity)
}

export function hasRole(role: string) {
    const roles = keycloak.tokenParsed?.realm_access?.roles || []
    return roles.includes(role)
}

export default keycloak