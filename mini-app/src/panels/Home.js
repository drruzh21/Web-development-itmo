// Файл: src/components/Home.js

import {Panel, PanelHeader, Header, Button, Group, Cell, Div, Avatar} from '@vkontakte/vkui';
import {useRouteNavigator} from '@vkontakte/vk-mini-apps-router';
import PropTypes from 'prop-types';
import React, {useState} from 'react';
import bridge from '@vkontakte/vk-bridge';

export const Home = ({id, fetchedUser}) => {
    const {photo_200, city, first_name, last_name} = {...fetchedUser};
    const routeNavigator = useRouteNavigator();

    const [randomImageUrl, setRandomImageUrl] = useState(null);

    const getRandomImage = async () => {
        try {
            const response = await fetch('https://dog.ceo/api/breeds/image/random');
            const data = await response.json();
            const imageUrl = data.message; // Т. к. данные приходят в формате { ... message: "image_url" ... }
            setRandomImageUrl(imageUrl); // Сохраняем в стейт
            return imageUrl; // Возвращаем URL для использования в редакторе историй
        } catch (error) {
            console.error('Ошибка при получении картинки:', error);
            return null;
        }
    };

    // Функция для открытия редактора историй с случайной картинкой
    const openStoryEditor = async () => {
        const imageUrl = await getRandomImage(); // Получаем случайную картинку
        if (imageUrl) {
            bridge.send('VKWebAppShowStoryBox', {
                background_type: 'image',
                url: imageUrl, // Используем URL случайной картинки
            });
        } else {
            console.error('Не удалось загрузить картинку');
        }
    };

    return (
        <Panel id={id}>
            <PanelHeader>Главная</PanelHeader>

            {/* Секция с данными пользователя */}
            {fetchedUser && (
                <Group header={<Header mode="secondary">Данные о пользователе, полученные с помощью VK Bridge</Header>}>
                    <Cell before={photo_200 && <Avatar src={photo_200}/>} subtitle={city?.title}>
                        {`${first_name} ${last_name}`}
                    </Cell>
                </Group>
            )}

            {/* Персик (решил оставить) */}
            <Group header={<Header mode="secondary">Navigation Example</Header>}>
                <Div>
                    <Button stretched size="l" mode="secondary" onClick={() => routeNavigator.push('persik')}>
                        Покажите Персика, пожалуйста!
                    </Button>
                </Div>
            </Group>

            {/* Секция для редактора историй */}
            <Group header={<Header mode="secondary">Story Editor</Header>}>
                <Div>
                    <Button stretched size="l" mode="primary" onClick={openStoryEditor}>
                        Открыть редактор историй с случайной картинкой собаки
                    </Button>
                </Div>
            </Group>
        </Panel>
    );
};

Home.propTypes = {
    id: PropTypes.string.isRequired,
    fetchedUser: PropTypes.shape({
        photo_200: PropTypes.string,
        first_name: PropTypes.string,
        last_name: PropTypes.string,
        city: PropTypes.shape({
            title: PropTypes.string,
        }),
    }),
};
