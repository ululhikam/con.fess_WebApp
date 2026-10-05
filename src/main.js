import { createApp } from 'vue';
import App from './App.vue';
import { createAppPlugins, bootstrap, configureApp } from './plugins';
import './style.css';

bootstrap();

const app = createApp(App);

configureApp(app);

for (const plugin of createAppPlugins()) {
  app.use(plugin);
}

app.mount('#app');
