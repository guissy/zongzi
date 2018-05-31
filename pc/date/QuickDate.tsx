import * as React from 'react';
import { Radio } from 'antd';
import styled from 'styled-components';
import moment from 'moment-timezone';
import withLocale from '../../../utils/withLocale';
import { DatePicker } from 'antd';
import { RangePickerValue } from 'antd/lib/date-picker/interface';

const { RangePicker } = DatePicker;
const QuickDateWrap = styled.div`
  button {
    margin-right: 10px;
  }
`;

interface Props {
  site?: (p: string) => React.ReactNode;
  onChange?: (value: [string, string]) => void; // 参考antd，返回数组
}
interface State {
  rangePickerValue: RangePickerValue;
}

/** 快选昨日/今日/上周/本周/上月/本月 */
@withLocale
export default class QuickDate extends React.PureComponent<Props, State> {
  state = {
    rangePickerValue: [undefined, undefined]
  };

  // tslint:disable-next-line:no-any
  onChangeDate = (e: any) => {
    let objTime: { from: string; to: string } = { from: '', to: '' };
    const value: string = e.target.value;
    moment.locale('zh'); // 中国区是周一为每周开始
    const now = moment();
    const todayStr = now.tz('America/Caracas').format('YYYY-MM-DD');
    const today = moment(todayStr);
    const yesterday = moment(todayStr).subtract(1, 'day');
    const week = moment(todayStr).startOf('week');
    const lastWeek = moment(week).subtract(1, 'week');
    const month = moment(todayStr).startOf('month');
    const lastMonth = moment(month).subtract(1, 'month');
    switch (value) {
      case '昨日':
        objTime.from = yesterday.format('YYYY-MM-DD') + ' 00:00:00';
        objTime.to =
          moment(yesterday)
            .endOf('day')
            .format('YYYY-MM-DD') + ' 23:59:59';
        break;
      case '今日':
        objTime.from = today.format('YYYY-MM-DD') + ' 00:00:00';
        objTime.to =
          moment(today)
            .endOf('day')
            .format('YYYY-MM-DD') + ' 23:59:59';
        break;
      case '本周':
        objTime.from = week.format('YYYY-MM-DD') + ' 00:00:00';
        objTime.to =
          moment(week)
            .endOf('week')
            .format('YYYY-MM-DD') + ' 23:59:59';
        break;
      case '上周':
        objTime.from = lastWeek.format('YYYY-MM-DD') + ' 00:00:00';
        objTime.to =
          moment(lastWeek)
            .endOf('week')
            .format('YYYY-MM-DD') + ' 23:59:59';
        break;
      case '本月':
        objTime.from = month.format('YYYY-MM-DD') + ' 00:00:00';
        objTime.to =
          moment(month)
            .endOf('month')
            .format('YYYY-MM-DD') + ' 23:59:59';
        break;
      case '上月':
        objTime.from = lastMonth.format('YYYY-MM-DD') + ' 00:00:00';
        objTime.to =
          moment(lastMonth)
            .endOf('month')
            .format('YYYY-MM-DD') + ' 23:59:59';
        break;
      default:
        return;
    }
    this.setState({
      rangePickerValue: [moment(objTime.from, 'YYYY-MM-DD'), moment(objTime.to, 'YYYY-MM-DD')]
    });
    if (typeof this.props.onChange === 'function') {
      this.props.onChange([objTime.from, objTime.to]);
    }
  }
  onRangeData = (date: RangePickerValue, dateString: string[]) => {
    let objTime: { from: string; to: string } = { from: '', to: '' };
    if (dateString[0] !== '' && dateString[1] !== '') {
      this.setState({
        rangePickerValue: [moment(dateString[0], 'YYYY-MM-DD'), moment(dateString[1], 'YYYY-MM-DD')]
      });
      objTime.from = dateString[0] + ' 00:00:00';
      objTime.to = dateString[1] + ' 23:59:59';
    } else {
      this.setState({
        rangePickerValue: [undefined, undefined]
      });
    }
    if (typeof this.props.onChange === 'function') {
      this.props.onChange([objTime.from, objTime.to]);
    }
  }
  render() {
    return (
      <QuickDateWrap>
        <RangePicker
          value={this.state.rangePickerValue}
          format="YYYY-MM-DD"
          showTime={false}
          onChange={this.onRangeData}
        />
      </QuickDateWrap>
    );
  }
}
