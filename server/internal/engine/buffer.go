package engine

import (
	"encoding/binary"
	"errors"
	"runtime"
	"unsafe"
)

const headerLength = 5

func (e *Engine) read(pointer unsafe.Pointer) ([]byte, error) {
	if pointer == nil {
		return nil, errors.New("engine returned no buffer")
	}
	header := unsafe.Slice((*byte)(pointer), headerLength)
	status := header[0]
	length := binary.LittleEndian.Uint32(header[1:])
	payload := make([]byte, length)
	copy(payload, unsafe.Slice((*byte)(unsafe.Add(pointer, headerLength)), length))
	e.dealloc(pointer, headerLength+length)
	if status != 0 {
		return nil, errors.New(string(payload))
	}
	return payload, nil
}

func (e *Engine) callWithBytes(input []byte, call func(unsafe.Pointer, uint32) unsafe.Pointer) ([]byte, error) {
	if len(input) == 0 {
		return e.read(call(nil, 0))
	}
	var pinner runtime.Pinner
	pinner.Pin(&input[0])
	defer pinner.Unpin()
	return e.read(call(unsafe.Pointer(&input[0]), uint32(len(input))))
}

func (e *Engine) callWithString(input string, call func(unsafe.Pointer, uint32) unsafe.Pointer) ([]byte, error) {
	return e.callWithBytes([]byte(input), call)
}
