import React, { Component } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import axios from 'axios';

import { apiConfig } from '../../config-api';
import FormBody from './FormBody';
import FormPageModal from './FormPageModal';

const getRadioInputValue = (radioName, input) => (
  input === undefined ? radioName : radioName + input
);

const formatedTime = (ampm, hour, minute) => {
  hour = (hour < 10) ? ("0" + hour) : hour;
  minute = (minute < 10) ? ("0" + minute) : minute;
  if (ampm == "a.m."){
    if(hour == "12"){
      return "00:" + minute;
    }
    else{
      return hour + ":" + minute;
    }
  }
  else {
    if (hour == "12"){
      return "12" + ":" + minute;
    }
    else {
      return String(Number(hour) + 12) + ":" + minute;
    }
  }
};

const getOtherSymptomsValue = (s) => {
  const rowIds = [...new Set(Object.keys(s).filter(key => /\bsymptoms_other/.test(key) && s[key] !== undefined).map(key => key.split('__')[1]))];
  return rowIds.map(id => ({ name: `其他：${s[`symptoms_other__${id}__input`]}`, date: s[`symptoms_other__${id}__date`] }));
};

const getSymptomsValue = (s) => {
  if (s.no_symptom__checkbox !== undefined && s.no_symptom__checkbox.length === 1) {
    return [];
  }
  const allSymptoms = getOtherSymptomsValue(s);
  const symptoms = [...new Set(Object.keys(s).filter(key => /\bsymptoms__radio/.test(key) && s[key] !== undefined).map(key => key.split('__')[2]))];
  for (let i = 0; i < symptoms.length; i += 1) {
    const symptom = symptoms[i];
    if (s[`symptoms__radio__${symptom}`] === '是') {
      allSymptoms.push({ name: symptom, date: s[`symptoms__date__${symptom}`] });
    }
  }
  return allSymptoms;
};

const getDoctorsValue = (s) => {
  const rowIds = [...new Set(Object.keys(s).filter(key => /\bseeing_doctor/.test(key) && s[key] !== undefined).map(key => key.split('__')[1]))];
  return rowIds.map(id => ({ type: s[`seeing_doctor__${id}__radio`], name: s[`seeing_doctor__${id}__input`], date: s[`seeing_doctor__${id}__date`] }));
};

const getChronicDiseaseValue = s => (
  s.chronic_disease__checkbox === undefined ? [] : s.chronic_disease__checkbox.map(name => (
    getRadioInputValue(name, s[`chronic_disease__input__${name}`])
  ))
);

const getRadioInputValue2 = (radioName, input, start_date, end_date) => (
  input === undefined ? radioName : `${radioName + input},${start_date},${end_date}`
);

const getFeverValue = s => (
  s.contact_fever__type__checkbox === undefined || s.contact_fever__radio === undefined || s.contact_fever__radio === '否' ? [] : s.contact_fever__type__checkbox.map((name) => {
    const tempName = '是（續填以下欄位，可複選）';
    if (name.slice(0, 2) === '其他') {
      return { name: `其他：${s[`contact_fever__type__input__${name}`]}`, start_date: `${s[`contact_fever__start_date__${tempName}`]}`, end_date: `${s[`contact_fever__end_date__${tempName}`]}` };
    } else {
      return { name, start_date: s[`contact_fever__start_date__${tempName}`], end_date: s[`contact_fever__end_date__${tempName}`] };
    }
  })
);

const getPatientValue = s => (
  s.contact_patient__type__checkbox === undefined || s.contact_patient__radio === undefined || s.contact_patient__radio === '否' ? [] : s.contact_patient__type__checkbox.map((name) => {
    const tempName = '是（續填以下欄位，可複選）';
    if (name.slice(0, 2) === '其他') {
      return { name: `其他：${s[`contact_patient__type__input__${name}`]}`, start_date: `${s[`contact_patient__start_date__${tempName}`]}`, end_date: `${s[`contact_patient__end_date__${tempName}`]}` };
    } else {
      return { name, start_date: s[`contact_patient__start_date__${tempName}`], end_date: s[`contact_patient__end_date__${tempName}`] };
    }
  })
);

const getSecretionValue = s => (
  s.contact_secretion__type__checkbox === undefined || s.contact_secretion__radio === undefined || s.contact_secretion__radio === '否' ? [] : s.contact_secretion__type__checkbox.map((name) => {
    const tempName = '是（續填以下欄位，可複選）';
    if (name.slice(0, 2) === '其他') {
      return { name: `其他：${s[`contact_secretion__type__input__${name}`]}`, start_date: `${s[`contact_secretion__start_date__${tempName}`]}`, end_date: `${s[`contact_secretion__end_date__${tempName}`]}` };
    } else {
      return { name, start_date: s[`contact_secretion__start_date__${tempName}`], end_date: s[`contact_secretion__end_date__${tempName}`] };
    }
  })
);

const getNationValue = (s) => {
  const rowIds = [...new Set(Object.keys(s).filter(key => /\bnation_and_location/.test(key) && s[key] !== undefined).map(key => key.split('__')[1]))];
  return rowIds.map(id => ({
    nation: s[`nation_and_location__${id}__nation`],
    type: s[`nation_and_location__${id}__type`],
    start_date: s[`nation_and_location__${id}__start_date`],
    end_date: s[`nation_and_location__${id}__end_date`],
    companion_num: s[`nation_and_location__${id}__companion_num`],
    companion_symptoms: s[`nation_and_location__${id}__companion_symptoms`],
    transport_and_flight_code: s[`nation_and_location__${id}__transport_and_flight_code`],
  }));
};

const getPublicValue = (s) => {
  const rowIds = [...new Set(Object.keys(s).filter(key => /\bpublic_area/.test(key) && s[key] !== undefined).map(key => key.split('__')[1]))];
  return rowIds.map(id => ({
    start_date: s[`public_area__${id}__start_date`],
    end_date: s[`public_area__${id}__end_date`],
    city: s[`public_area__${id}__city`],
    location: s[`public_area__${id}__location`],
    transportation: s[`public_area__${id}__transportation`],
  }));
};

const getCloseContactorValue = (s) => {
  const rowIds = [...new Set(Object.keys(s).filter(key => /\bclose_contactor/.test(key) && s[key] !== undefined).map(key => key.split('__')[1]))];
  return rowIds.map(id => ({
    type: s[`close_contactor__${id}__type`],
    number: s[`close_contactor__${id}__number`],
    symptom_count: s[`close_contactor__${id}__symptom_count`],
    fever_count: s[`close_contactor__${id}__fever_count`],
    last_date: s[`close_contactor__${id}__last_date`],
    note: s[`close_contactor__${id}__note`],
  }));
};

const getActivityValue = (s) => {
  const rowIds = [...new Set(Object.keys(s).filter(key => /\bactivity_detail/.test(key) && s[key] !== undefined).map(key => key.split('__')[1]))];
  return rowIds.map(id => ({
    date: s[`activity_detail__${id}__date`],
    start_time: formatedTime(s[`activity_detail__${id}__start_time_ampm`], s[`activity_detail__${id}__start_time_hour`], s[`activity_detail__${id}__start_time_minute`]),
    end_time: formatedTime(s[`activity_detail__${id}__end_time_ampm`], s[`activity_detail__${id}__end_time_hour`], s[`activity_detail__${id}__end_time_minute`]),
    description: s[`activity_detail__${id}__description`],
  }));
};

const getForm = s => ({
  id: s.id,
  timestamp: Date.now(),
  information: {
    inv_date: s.inv_date,
    inv_person: s.inv_person,
    inv_institution: s.inv_institution,
    report_date: s.report_date,
    name: s.name,
    gender: s.gender,
    birth_date: s.birth_date,
    nationality: getRadioInputValue(s.nationality__radio, s[`nationality__input__${s.nationality__radio}`]),
    address_city: s.address_city,
    address_area: s.address_area,
    address_detail: s.address,
    contact: s.contact,
    occupation: s.occupation,
    med_title: getRadioInputValue(s.med_title__radio, s[`med_title__input__${s.med_title__radio}`]),
    onset: s.onset,
    pregnant_week: getRadioInputValue(s.pregnant_week__radio, s[`pregnant_week__input__${s.pregnant_week__radio}`]),
    married: s.married__radio,
  },
  health_condition: {
    symptoms: getSymptomsValue(s),
    seeing_doctor: getDoctorsValue(s),
    chronic_disease: getChronicDiseaseValue(s),
  },
  source: {
    nation_and_location: getNationValue(s),
    contact_fever: getFeverValue(s),
    contact_patient: getPatientValue(s),
    contact_secretion: getSecretionValue(s),
    infect: getRadioInputValue2(s.infect__radio, s[`infect__input__${s.infect__radio}`], s[`infect__start_date__${s.infect__radio}`], s[`infect__end_date__${s.infect__radio}`]),
    market: getRadioInputValue2(s.market__radio, s[`market__input__${s.market__radio}`], s[`market__start_date__${s.market__radio}`], s[`market__end_date__${s.market__radio}`]),
    hospital: getRadioInputValue2(s.hospital__radio, s[`hospital__input__${s.hospital__radio}`], s[`hospital__start_date__${s.hospital__radio}`], s[`hospital__end_date__${s.hospital__radio}`]),
    pet: getRadioInputValue(s.pet__radio, s[`pet__input__${s.pet__radio}`]),
    bird: getRadioInputValue(s.bird__radio, s[`bird__input__${s.bird__radio}`]),
    farm: getRadioInputValue(s.farm__radio, s[`farm__input__${s.farm__radio}`]),
    shamble: getRadioInputValue(s.shamble__radio, s[`shamble__input__${s.shamble__radio}`]),
    wild: getRadioInputValue(s.wild__radio, s[`wild__input__${s.wild__radio}`]),
    other: getRadioInputValue(s.other__radio, s[`other__input__${s.other__radio}`]),
  },
  contactor: {
    public_area: getPublicValue(s),
    close_contactor: getCloseContactorValue(s),
  },
  activity: {
    activity_detail: getActivityValue(s),
  },
  note: {
    note_content: s.note_content,
  },
  orig_state: JSON.stringify(s),
});

/**
 * This Component shows FormPage.
 * @extends Component */
class FormPage extends Component {
  /**
   * @param {object} props - The props used to construct. */
  constructor(props) {
    super(props);

    const params = new URLSearchParams(window.location.search);
    if (params.has('id')) {
      if (params.get('id') === '') { // If id === '', it gets all data from db.
        this.props.changeMode(1, { error: true });
      } else {
        this.search(params.get('id'));
      }
    }

    this.state = {
      submitting: false,
    };

    this.search = this.search.bind(this);
    this.submit = this.submit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleColumnRemove = this.handleColumnRemove.bind(this);
    this.handleColumnCopy = this.handleColumnCopy.bind(this);
    this.handleModalConfirm = this.handleModalConfirm.bind(this);
    this.handleModalClose = this.handleModalClose.bind(this);
  }

  /**
   * Search form by id.
   * @param {string} id - The id to search. */
  search(id) {
    console.log(id);
    axios.get(apiConfig.mongoGet.replace(':id', id))
      .then((res) => {
        // console.log(res.data);
        if (res.data === '') {
          this.props.changeMode(1, { error: true });
        } else {
          const newState = JSON.parse(res.data.orig_state);
          // console.log(newState);
          newState.editMode = true;
          newState.submitting = false;
          newState.modalShowed = false;
          this.setState(newState);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  /**
   * Handle modal confirm. */
  handleModalConfirm() {
    this.setState({ modalShowed: true, showModal: false }, () => this.submit());
  }

  /**
   * Handle modal close. */
  handleModalClose() {
    this.setState({ showModal: false, submitting: false });
  }

  /**
   * Post the data to backend. */
  submit() {
    // console.log(getForm(this.state));
    this.setState({ submitting: true });
    if (this.state.editMode) {
      axios.get(apiConfig.mongoGet.replace(':id', this.state.id))
        .then((res) => {
          if (!this.state.modalShowed) {
            this.setState({
              showModal: true,
              editMode: (res.data === '' ? 'new' : 'edit'),
            });
          } else if (res.data === '') {
            axios.post(apiConfig.mongoPost, getForm(this.state))
              .then((r) => {
                console.log(r.data);
                this.props.changeMode(1);
              })
              .catch((err) => {
                console.log(err);
              });
          } else {
            axios.put(apiConfig.mongoPut.replace(':id', this.state.id), getForm(this.state))
              .then((r) => {
                console.log(r.data);
                this.props.changeMode(1);
              })
              .catch((err) => {
                console.log(err);
              });
          }
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      axios.post(apiConfig.mongoPost, getForm(this.state))
        .then((res) => {
          console.log(res.data);
          this.props.changeMode(1);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }

  /**
   * Handle the change of a column in the form.
   * @param {object} event - The event of the column. */
  handleChange(event) {
    const { name, type, checked } = event.target;
    let { value } = event.target;
    if (type === 'checkbox') {
      if (checked === true) {
        value = this.state[name] === undefined ? [value] : this.state[name].concat(value);
      } else {
        value = this.state[name].filter(val => val !== value);
      }
    }
    this.setState({ [name]: value });
    setTimeout(() => console.log(this.state), 1000);
  }

  /**
   * Handle the removal of a column in a multi-column section.
   * @param {object} target - The id of the target column. */
  handleColumnRemove(target) {
    const re = RegExp(`\\b${target}`);
    Object.keys(this.state).forEach((key) => {
      if (re.test(key)) {
        this.setState({ [key]: undefined });
      }
    });
  }

  handleColumnCopy(from, to) {
    const re_from = RegExp(`\\b${from}`);
    const re_to = RegExp(`\\b${to}`);
    Object.entries(this.state).forEach(([key, val]) => {
      if (re_from.test(key)) {
        this.setState({ [to + '__' + key.split('__')[2]]: val });
      }
    });
  }

  /**
   * @return {JSX} - A syntax extension to JavaScript, which will be
   * eventually compiled into html code. */
  render() {
    return (
      <div className="form-page">
        <Container>
          <Row style={{ margin: '2rem 0 0 0' }}>
            <Col lg={{ span: 6, offset: 4 }} style={{ textAlign: 'right' }}>
              {this.state.editMode ?
                <Button variant="dark" onClick={() => this.props.changeMode(0)}>
                  填新疫調單 ＞
                </Button>
              :
                <Button variant="dark" onClick={() => this.props.changeMode(2)}>
                  編輯資料庫中的疫調單（前往搜尋頁面）＞
                </Button>}
            </Col>
          </Row>
          <Row className="justify-content-center" style={{ margin: '1rem 0 2rem 0' }}>
            <Col lg="8">
              <FormBody
                handleChange={this.handleChange}
                handleColumnRemove={this.handleColumnRemove}
                handleColumnCopy={this.handleColumnCopy}
                submit={this.submit}

                {...this.state}
              />
            </Col>
          </Row>
        </Container>

        <FormPageModal
          handleModalClose={this.handleModalClose}
          handleModalConfirm={this.handleModalConfirm}
          showModal={this.state.showModal}
          editMode={this.state.editMode}
          id={this.state.id}
        />
      </div>
    );
  }
}

export default FormPage;
