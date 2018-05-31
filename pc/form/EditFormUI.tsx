import * as React from 'react';
import styled from 'styled-components';
import { select } from '../../../utils/model';
import { Modal, Form } from 'antd';
import { FormUI, FormConfig } from './FormUI';
import withLocale from '../../../utils/withLocale';
import { Result } from '../../../utils/result';
import { RangePickerValue } from 'antd/lib/date-picker/interface';
import moment, { Moment } from 'moment-timezone';
import { WrappedFormUtils } from 'antd/es/form/Form';
import { messageError, messageSuccess } from '../../../utils/showMessage';

// tslint:disable-next-line:no-any
const ModalWrap = styled(Modal as any)`
  padding-bottom: 0;

  .ant-modal-body {
    padding: 16px 24px 0 24px;
    display: flex;

    > section {
      width: 100%;
    }
  }

  .submitItem {
    border-top: 1px solid #e8e8e8;
    border-radius: 0 0 4px 4px;
    margin: 0 -24px 0 -24px;
    padding: 8px 16px;
    text-align: center;
  }
`;

function getMomentFromString(value: string[] | number[]) {
  let valueOk: RangePickerValue;
  if (!Array.isArray(value)) {
    valueOk = [undefined, undefined];
  } else {
    let [fromValue, toValue] = value;
    let fromMoment;
    let toMoment;
    if (typeof fromValue !== 'object') {
      fromMoment = moment(fromValue);
    } else {
      fromMoment = fromValue as Moment;
    }
    if (typeof toValue !== 'object') {
      toMoment = moment(toValue);
    } else {
      toMoment = toValue as Moment;
    }
    valueOk = [fromMoment, toMoment];
  }
  return valueOk;
}

/**
 * onSubmit 手动：自行保存数据等，此方法必须返回Promise组件才能够关闭模态框
 * actionType 自动：组件会dispatch, 弹成功失败消息，重置表单，关闭模态框
 * @example
 * <EditFormUI
 *  modalTitle={'编辑'}
 *  modalVisible={true}
 *  fieldConfig={this.config('edit')}
 *  form={form}
 *  values={editing}
 *  onSubmit={this.onSubmit}
 *  onCancel={this.onEdit}
 *  onDone={this.onSaveDone}
 * />
 */

@withLocale
@select('')
@Form.create()
export class EditFormUI extends React.PureComponent<Props, State> {
  static getDerivedStateFromProps = (nextProps: Props, prevState: State) => {
    const fieldConfig = nextProps.fieldConfig;
    const values = nextProps.values;
    let fieldConfigOk = prevState.fieldConfig;
    if (values) {
      fieldConfigOk = fieldConfig.map(v => {
        let formInitialValue;
        // 有逗号隔开的字段名，表示这是日期范围
        if (v.dataIndex.includes(',')) {
          const [fromKey, toKey] = v.dataIndex.split(',').map((key: string) => key.trim());
          formInitialValue = getMomentFromString([
            values[fromKey], // 开始日期
            values[toKey] // 结束日期
          ]);
        } else {
          formInitialValue = values[v.dataIndex];
        }
        return {
          ...v,
          formInitialValue
        };
      });
    }
    return {
      visible: nextProps.modalVisible,
      fieldConfig: fieldConfigOk,
      editContext: { ...prevState.editContext, ...nextProps.editContext }
    };
  }

  state = {
    visible: false,
    fieldConfig: this.props.fieldConfig,
    editContext: {}
  };

  constructor(props: Props) {
    super(props);
  }

  // 保存成功后弹提示
  showMessage = (result: Result<object>) => {
    const { site = () => '' } = this.props;
    if (typeof result === 'object' && 'state' in result) {
      const { state } = result;
      if (state === 0) {
        messageSuccess(this.props.modalOk || site('操作成功！'));
      } else {
        messageError(site('操作失败，请重试！'));
        console.info(`🐞: `, result.message);
      }
    } else {
      console.error(
        'modal.ts 中的 effects 其中返回值是从后端拿到 {state:0, message: \'OK\', data: [] } '
      );
    }
  }

  public render() {
    const { visible, fieldConfig } = this.state;
    const { site = () => '' } = this.props;
    const {
      actionType,
      onSubmit,
      modalTitle,
      submitText = site('确定'),
      onCancel,
      onDone,
      values,
      size,
      view,
      isPage
    } = this.props;
    let width = 0;
    let formItemProps = {};
    switch (size) {
      case 'large':
        width = 1200;
        formItemProps = { labelCol: { span: 5 }, wrapperCol: { span: 18 } };
        break;
      case 'small':
        width = 520;
        formItemProps = { labelCol: { span: 6 }, wrapperCol: { span: 13 } };
        break;
      default:
        width = 800;
        formItemProps = { labelCol: { span: 6 }, wrapperCol: { span: 13 } };
        break;
    }
    const Wrap = isPage ? styled.div`` : ModalWrap;
    return (
      <Wrap
        title={modalTitle}
        // onOk={}
        onCancel={onCancel}
        width={width}
        footer={null}
        visible={visible}
        destroyOnClose={true}
      >
        <FormUI
          fieldConfig={fieldConfig}
          actionType={actionType}
          onSubmit={onSubmit}
          submitText={submitText}
          defaultFormItemProps={formItemProps}
          formLayout={'horizontal'}
          showMessage={this.showMessage}
          onCancel={onCancel}
          onDone={onDone}
          resetFields={true}
          record={values}
          view={view}
        />
      </Wrap>
    );
  }
}

interface Props {
  form?: WrappedFormUtils;
  fieldConfig: EditFormConfig[]; // 字段配置
  actionType?: string; // namespace/effect
  modalTitle?: string | React.ReactNode; // 模态框标题
  submitText?: string; // 确认按钮文字
  modalVisible?: boolean; // 是否显示模态框
  site?: (words: string) => string;
  size?: 'large' | 'small'; // modal 宽
  values?: { isTotalRow?: boolean } & { [key: string]: any }; // tslint:disable-line
  editContext?: Partial<EditContext>; // 上下文
  onSubmit?: (values: object) => Promise<Result<object> | void>; // 提交事件，返回Promise，用于关闭模态框，清理表单
  onCancel?: Function; // 关闭事件
  onDone?: (result: Result<object> | void) => void; // onSubmit后的回调
  view?: React.PureComponent;
  isPage?: boolean;
  modalOk?: React.ReactNode;
}

interface State {
  visible: boolean; // 模态框是否可见
  fieldConfig: EditFormConfig[]; // 字段配置
  editContext: Partial<EditContext>; // 上下文
}

/** 上下文数据类型 */
export interface EditContext {
  setState: (editContextNext: object) => void;
  form?: WrappedFormUtils;
  [key: string]: any; // tslint:disable-line:no-any
}

/** 编辑字段 */
export interface EditFormConfig extends FormConfig {}
