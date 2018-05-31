import * as React from 'react';
import environment from '../../../utils/environment';

// ueditor需要的相关文件
import '../../../assets/ueditor/ueditor.config';
import '../../../assets/ueditor/ueditor.all';
import '../../../assets/ueditor/lang/zh-cn/zh-cn';

const toolbar = [
  [
    // 'anchor', //锚点
    // 'undo', //撤销
    // 'redo', //重做
    'bold', // 加粗
    'indent', // 首行缩进
    // 'snapscreen', //截图
    'italic', // 斜体
    'underline', // 下划线
    'strikethrough', // 删除线
    'subscript', // 下标
    'fontborder', // 字符边框
    'superscript', // 上标
    'formatmatch', // 格式刷
    // 'source', //源代码
    'blockquote', // 引用
    'pasteplain', // 纯文本粘贴模式
    'selectall', // 全选
    // 'print', //打印
    // 'preview', //预览
    'horizontal', // 分隔线
    'removeformat', // 清除格式
    'time', // 时间
    'date', // 日期
    'unlink', // 取消链接
    'insertrow', // 前插入行
    'insertcol', // 前插入列
    'mergeright', // 右合并单元格
    'mergedown', // 下合并单元格
    'deleterow', // 删除行
    'deletecol', // 删除列
    'splittorows', // 拆分成行
    'splittocols', // 拆分成列
    'splittocells', // 完全拆分单元格
    'deletecaption', // 删除表格标题
    'inserttitle', // 插入标题
    'mergecells', // 合并多个单元格
    'deletetable', // 删除表格
    'cleardoc', // 清空文档
    'insertparagraphbeforetable', // "表格前插入行"
    'insertcode', // 代码语言
    'fontfamily', // 字体
    'fontsize', // 字号
    'paragraph', // 段落格式
    // 'simpleupload', //单图上传
    'insertimage', // 多图上传
    // 'edittable', //表格属性
    'edittd', // 单元格属性
    'link', // 超链接
    // 'emotion', //表情
    'spechars', // 特殊字符
    'searchreplace', // 查询替换
    // 'map', //Baidu地图
    // 'gmap', //Google地图
    // 'insertvideo', //视频
    'help', // 帮助
    'justifyleft', // 居左对齐
    'justifyright', // 居右对齐
    'justifycenter', // 居中对齐
    'justifyjustify', // 两端对齐
    'forecolor', // 字体颜色
    'backcolor', // 背景色
    'insertorderedlist', // 有序列表
    'insertunorderedlist', // 无序列表
    // 'fullscreen', //全屏
    'directionalityltr', // 从左向右输入
    'directionalityrtl', //  从右向左输入
    'rowspacingtop', // 段前距
    'rowspacingbottom', // 段后距
    'pagebreak', // 分页
    // 'insertframe', //插入Iframe
    'imagenone', // 默认
    'imageleft', // 左浮动
    'imageright', // 右浮动
    // 'attachment', //附件
    'imagecenter', // 居中
    // 'wordimage', //图片转存
    'lineheight', // 行间距
    'edittip ', // 编辑提示
    'customstyle', // 自定义标题
    'autotypeset', // 自动排版
    // 'webapp', //百度应用
    'touppercase', // 字母大写
    'tolowercase', // 字母小写
    // 'background', //背景
    // 'template', //模板
    // 'scrawl', //涂鸦
    // 'music', //音乐
    'inserttable' // 插入表格
    // 'drafts', // 从草稿箱加载
    // 'charts', // 图表
  ]
];

/** 富文本编辑器Props */
export interface Props {
  id: string;
  value?: string;
  config?: object;
  hidden?: boolean;
  onChange?: (value: string) => void;
}

interface State {
  value: string;
  ready: boolean;
  config?: object;
}

declare global {
  namespace UE {
    /** 全局的方法得到编辑器实例 */
    export function getEditor(e: string, t?: object): typeof UE;
    /** 销毁 */
    export function destroy(): void;
    /** iframe 容器 */
    export const container: HTMLElement;
    /** 初始化值 */
    export function setContent(value: string | undefined): void;
    /** 初始化回调 */
    export function ready(cb: () => void): void;
    /** 编辑时回调 */
    export function addListener(eventName: string, cb: () => void): void;
    /** 编程后的内容 */
    export function getContent(): string;
  }
  interface Window {
    UEDITOR_HOME_URL: string;
    UE: typeof UE;
  }
}

/** 富文本编辑器 */
export default class Editor extends React.PureComponent<Props, State> {
  UE: typeof UE;
  cacheContent: string = '';
  UEditorValueCount: number;
  constructor(props: Props) {
    super(props);
    this.state = {
      value: this.props.value || '',
      ready: false,
      config: {
        toolbars: toolbar,
        autoFloatEnabled: false,
        enableAutoSave: false,
        autoSyncData: false,
        serverUrl: environment.apiHost + '/ueditor',
        autoHeightEnabled: false,
        initialFrameHeight: 300
      }
    };
  }

  componentDidMount() {
    this.UEditorValueCount = 0;
    this.UE = window.UE.getEditor(
      this.props.id,
      Object.assign(this.state.config, this.props.config)
    );
    this.UE.ready(() => {
      this.UE.setContent(this.state.value);
      this.setState({ ready: true });
    });

    this.UE.addListener('contentChange', () => {
      let content = window.UE.getEditor(this.props.id).getContent();
      if (typeof this.props.onChange === 'function' && this.cacheContent !== content) {
        this.props.onChange(content);
      }
      this.cacheContent = content;
    });
  }

  componentWillReceiveProps(nextProps: Props) {
    if (this.state.ready) {
      this.UE.setContent(nextProps.value || '');
    }
    this.setState({
      value: nextProps.value || ''
    });
  }

  componentWillUnmount() {
    if (this.UE.container) {
      this.UE.destroy();
    }
  }

  render() {
    return (
      <div hidden={this.props.hidden}>
        <script style={{ width: '100%' }} id={this.props.id} type="text/plain" />
      </div>
    );
  }
}
