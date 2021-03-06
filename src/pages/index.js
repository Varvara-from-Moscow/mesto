
import './index.css';
import {
  meanForValidationConfig,
  profileEditButton,
  addButton,
  popupAddPictureForm,
  popupProfileForm,
  profileNameSelector,
  profileJobSelector,
  nameInput,
  jobInput,
  popupAddPicture,
  cardContainer,
  popupFullSizePicture,
  popupProfile,
  profileAvatarSelector,
  updateAvatarButton,
  popapAreYouSureToDelete,
  popupUpdateAvatar,
  popupUpdateAvatarForm
} from '../utils/constants.js';

import Card from '../components/Card.js';
import FormValidator from '../components/FormValidator.js';
import Section from '../components/Section.js';
import PopupWithImage from '../components/PopupWithImage.js';
import PopupWithForm from '../components/PopupWithForm.js';
import UserInfo from '../components/UserInfo.js';
import PopupToDelete from '../components/PopupToDelete.js';
import Api from '../components/Api';

let userId;

const popupWithImage = new PopupWithImage(popupFullSizePicture);
const userInfo = new UserInfo({profileName: profileNameSelector, profileJob: profileJobSelector, profileAvatar: profileAvatarSelector});
const areYouSureToDeletePopup = new PopupToDelete(popapAreYouSureToDelete);

const popupProfileFormValid = new FormValidator(meanForValidationConfig, popupProfileForm);
const popupAddPictureFormValid = new FormValidator(meanForValidationConfig, popupAddPictureForm);
const popupAvatarValid = new FormValidator(meanForValidationConfig, popupUpdateAvatarForm);

// Слушатель на кнопку открытия popup редактирования аватара
updateAvatarButton.addEventListener('click', () => {
  avatarEditPopup.showLoading(false);
  popupAvatarValid.resetValidation();
  avatarEditPopup.open();
});

const api = new Api({
  url:'https://mesto.nomoreparties.co/v1/cohort-38',
  headers: {
    authorization: '482a243d-811c-428c-9d72-a4802c45fd09',
    'Content-Type': 'application/json'
  }
});


Promise.all([api.getUserInfo(), api.getInitialCards()])
  .then(([data, cards]) => {
      userId = data._id;
      userInfo.setUserInfo(data);
      initialCardsList.renderItems(cards);
  })
  .catch(err => {
    console.log(err);
  });

/*
//загрузка информации (имя и проф) о пользователе с сервера
api.getUserInfo()
.then((data) => {
userId = data._id;
userInfo.setUserInfo(data);
})
.catch((err) => {
  console.log(err);
});

//закрузка карточек с сервера
api.getInitialCards()
.then((data) => {
  initialCardsList.renderItems(data);
})
.catch((err) => {
  console.log(err);
});*/

function createCard(data) {
  const card = new Card({
    data: data,
    handleCardClick: () => {
      popupWithImage.open(data);
    },
    handleCardDelete: () => {
      areYouSureToDeletePopup.setSubmitAction(() => {
        areYouSureToDeletePopup.showLoading(true);
        api.deleteCard(data._id)
        .then(() => {
        card.deleteCard();
        areYouSureToDeletePopup.close();
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          areYouSureToDeletePopup.showLoading(false);
        })
      })
      areYouSureToDeletePopup.open();
    },
    handleLikeClick: () => {
      card.putLike();
    }
  }, '#cards-template', api, userId);

  return card.generateCard();
}

const initialCardsList = new Section({
  renderer: (data) => {
    initialCardsList.addItemAppend(createCard(data));
  }
}, cardContainer);

// Добавление карточки с введенными в инпут данными + отправка этих данных на сервер
const popupAddCard = new PopupWithForm(popupAddPicture, (inputsValues) => {
  popupAddCard.showLoading(true);
  api.addUserCard(inputsValues)
    .then((data) => {
      initialCardsList.addItem(createCard(data));
      popupAddCard.close();
      popupAddPictureFormValid.resetValidation();
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      popupAddCard.showLoading(false);
    })
});

// Создание экземпляра класса popup с обновлением новых данных о пользователе
const popupEditProfile = new PopupWithForm(popupProfile, (userData) => {
  popupEditProfile.showLoading(true);
  api.setUserInfo(userData)
    .then((data) => {
      userInfo.setUserInfo(data);
      popupEditProfile.close();
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      popupEditProfile.showLoading(false);
    })
});

const avatarEditPopup = new PopupWithForm(popupUpdateAvatar, (inputsValues) => {
  avatarEditPopup.showLoading(true);
  api.updateUserAvatar(inputsValues)
    .then((data) => {
      userInfo.setUserAvatar(data);
      avatarEditPopup.close();
      popupAvatarValid.resetValidation();
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      avatarEditPopup.showLoading(false);
    })
});


//Knopki
addButton.addEventListener('click',() => {
  popupAddPictureFormValid.resetValidation();
  popupAddCard.open();
});


profileEditButton.addEventListener('click',() => {
  const {name, about} = userInfo.getUserInfo();
  popupEditProfile.showLoading(false);
  popupProfileFormValid.resetValidation();
  nameInput.value = name;
  jobInput.value = about;
  popupEditProfile.open();
});


popupAddCard.setEventListeners();
popupWithImage.setEventListeners();
popupEditProfile.setEventListeners();
areYouSureToDeletePopup.setEventListeners();
avatarEditPopup.setEventListeners();

popupProfileFormValid.enableValidation();
popupAddPictureFormValid.enableValidation();
popupAvatarValid.enableValidation();